import { ActionFunction, redirect } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");

  // バリデーション
  if (typeof name !== "string" || typeof content !== "string") {
    throw new Error("Form not submit correctly");
  }

  const fields = { content, name };
  const joke = await db.joke.create({ data: fields });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name: <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label>
            Content: <textarea name="content" />
          </label>
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
