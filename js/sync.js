// Cloud sync (Firebase): the phone app pushes changed docs, the desktop viewer watches them live.
// Loaded with dynamic import() so the app still works offline or if the CDN is unreachable.
import { firebaseConfig } from "./firebase-config.js";
import { toCloudDocs, fromCloudDocs, cloudDiff } from "./store.js";

const V = "https://www.gstatic.com/firebasejs/10.12.2";
if (!firebaseConfig) throw new Error("cloud sync not configured");
const [{ initializeApp }, A, F] = await Promise.all([
  import(`${V}/firebase-app.js`), import(`${V}/firebase-auth.js`), import(`${V}/firebase-firestore.js`),
]);

const app = initializeApp(firebaseConfig);
const auth = A.getAuth(app);
const db = F.initializeFirestore(app, { ignoreUndefinedProperties: true });
const col = (uid) => F.collection(db, "users", uid, "data");

export const cloud = {
  user: null,
  signIn: () => A.signInWithPopup(auth, new A.GoogleAuthProvider()).catch((e) => alert(`로그인 실패: ${e.code || e.message}`)),
  signOut: () => A.signOut(auth),
  onUser(cb) { return A.onAuthStateChanged(auth, (u) => { cloud.user = u; cb(u); }); },
};

// Phone side: call push() after every save; also runs on sign-in to upload anything not yet sent.
export function startPush(storage, getState) {
  let chain = Promise.resolve();
  const push = () => {
    chain = chain.then(async () => {
      const u = cloud.user;
      if (!u) return;
      const key = `overload-sync-${u.uid}`; // hashes of docs the server has confirmed
      let sent = {};
      try { sent = JSON.parse(storage.getItem(key)) || {}; } catch {}
      const docs = toCloudDocs(getState());
      const { next, set, del } = cloudDiff(docs, sent);
      if (!set.length && !del.length) return;
      const b = F.writeBatch(db);
      for (const id of set) b.set(F.doc(col(u.uid), id), docs[id]);
      for (const id of del) b.delete(F.doc(col(u.uid), id));
      await b.commit(); // resolves only after the server accepts; if the page closes first, next start retries
      try { storage.setItem(key, JSON.stringify(next)); } catch {}
    }).catch((e) => console.error("cloud push failed", e));
  };
  cloud.onUser((u) => { if (u) push(); });
  return push;
}

// Desktop side: cb(state) on every cloud change while signed in; cb(null) when signed out.
export function watch(cb) {
  let stop = null;
  cloud.onUser((u) => {
    if (stop) { stop(); stop = null; }
    if (!u) { cb(null); return; }
    stop = F.onSnapshot(col(u.uid), (snap) => cb(fromCloudDocs(snap.docs.map((d) => [d.id, d.data()]))),
      (e) => { console.error("cloud watch failed", e); alert(`클라우드 읽기 실패: ${e.code || e.message}`); });
  });
}
