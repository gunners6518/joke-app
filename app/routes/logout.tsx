import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";
import { logout } from "~/utils/session.server";

// logoutする
export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

//home画面にredirect
export const loader: LoaderFunction = async () => {
  return redirect("/");
};
