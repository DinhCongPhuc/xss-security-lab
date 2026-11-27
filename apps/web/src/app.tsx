import { Route, Routes } from "react-router";
import { routePages } from "./config/navigation.ts";
import { Shell } from "./layouts/shell.tsx";
import { NotFound, Overview, Placeholder } from "./pages/placeholder.tsx";

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        {routePages.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={
              page.path === "/" ? (
                <Overview page={page} />
              ) : (
                <Placeholder page={page} />
              )
            }
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
