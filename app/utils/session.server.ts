import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "remix";
import { db } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

// ユーザーが登録さてていれば、Userを、いなければnullを返す
export async function login({ username, password }: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) return null;

  // userのpasswordとformのpasswordが一致するかチェック
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;

  return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  //userId取得
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }
  try {
    // userIdからuserデータを取得
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch {
    //userが取得出来なければlogout
    throw logout(request);
  }
}

export async function logout(request: Request) {
  // requestからcookie経由でsessionを取得
  const session = await storage.getSession(request.headers.get("cookie"));
  // sessionを破棄してlogin画面に遷移
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

// 新しいsessionを作成する
export async function createUserSession(userId: string, redirecTo: string) {
  const session = await storage.getSession();
  // userIDをsessionに保存
  session.set("userId", userId);
  return redirect(redirecTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
