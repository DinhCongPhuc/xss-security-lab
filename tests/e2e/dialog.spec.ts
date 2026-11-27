import { expect, test } from "@playwright/test";

test("centered Dialog contains focus with one or zero tabbable controls", async ({
  page,
}) => {
  await page.goto("/");
  const entry = await (await page.request.get("/src/main.tsx")).text();
  const react = entry.match(/from\s+"([^"]*\/react\.js\?[^"]+)"/)?.[1];
  const client = entry.match(
    /from\s+"([^"]*\/react-dom_client\.js\?[^"]+)"/,
  )?.[1];
  if (!react || !client)
    throw new Error("Could not resolve the app's Vite React modules");
  await page.evaluate(
    async ({ react, client }) => {
      const [{ default: React }, { default: ReactDOM }, { Dialog }] =
        await Promise.all([
          import(react),
          import(client),
          import("/src/components/ui/dialog.tsx" as string),
        ]);
      const fixture = document.createElement("section");
      document.body.append(fixture);
      function Fixture() {
        const [open, setOpen] = React.useState(false);
        return React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "button",
            { onClick: () => setOpen(true) },
            "Open fixture",
          ),
          React.createElement(
            Dialog,
            { title: "Centered fixture", open, onClose: () => setOpen(false) },
            React.createElement(
              "button",
              { disabled: true },
              "Disabled fixture",
            ),
            React.createElement(
              "button",
              { tabIndex: -1 },
              "Non-tabbable fixture",
            ),
          ),
        );
      }
      ReactDOM.createRoot(fixture).render(React.createElement(Fixture));
    },
    { react, client },
  );
  const opener = page.getByRole("button", { name: "Open fixture" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Centered fixture" });
  const close = dialog.getByRole("button", { name: "Đóng" });
  await expect(close).toBeFocused();
  expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(
    true,
  );
  await page
    .locator("main a")
    .first()
    .evaluate((element) => (element as HTMLElement).focus());
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(close).toBeFocused();

  await close.evaluate((element) => {
    (element as HTMLButtonElement).disabled = true;
  });
  await page.keyboard.press("Tab");
  await expect(dialog).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});
