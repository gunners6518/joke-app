import type { ActionFunction } from "remix";
import { useActionData, redirect, json } from "remix";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

// フォームバリデーションの追加
function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke too short";
  }
}

function validateJokeName(name: string) {
  if (name.length < 2) {
    return "That joke`s name too short";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

// 送信エラーの定義
const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  // formを取得
  const userId = await requireUserId(request);
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");

  // undefiendなどを除外する
  if (typeof name !== "string" || typeof content !== "string") {
    {
      return badRequest({
        formError: `Form not submitted correctly.`,
      });
    }
  }

  // バリデーションメッセージを取得
  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };

  const fields = { name, content };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const joke = await db.joke.create({
    data: { ...fields, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:
            <input
              type="text"
              defaultValue={actionData?.fields?.name}
              name="name"
              aria-invalid={Boolean(actionData?.fieldErrors?.name || undefined)}
              aria-describedby={
                actionData?.fieldErrors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className={"form-validation-error"} role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.content ? "content-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className={"form-validation-error"}
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
