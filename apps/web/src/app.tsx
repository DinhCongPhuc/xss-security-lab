import { Link, Route, Routes } from "react-router";
import { Shell } from "./layouts/shell.tsx";
import { AttackLab, labs } from "./features/attack-lab/index.tsx";
import { Placeholder } from "./pages/placeholder.tsx";
const pages = [
  [
    "/",
    "Tổng quan",
    "Nền tảng học về Cross-Site Scripting và các biện pháp phòng vệ.",
  ],
  ["/knowledge", "Kiến thức", "Tài liệu nền tảng về XSS đang được chuẩn bị."],
  [
    "/defense-lab",
    "Defense Lab",
    "Khu vực dành cho các biện pháp phòng vệ XSS.",
  ],
  ["/code-analysis", "Phân tích mã", "Khu vực dành cho phân tích mã nguồn."],
  ["/logs", "Nhật ký", "Khu vực dành cho nhật ký thí nghiệm."],
  ["/reports", "Báo cáo", "Khu vực dành cho báo cáo học tập."],
  ["/settings", "Cài đặt", "Khu vực dành cho cấu hình ứng dụng."],
] as const;
export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        {pages.map(([path, title, description]) => (
          <Route
            key={path}
            path={path}
            element={<Placeholder title={title} description={description} />}
          />
        ))}
        <Route path="/attack-lab" element={<AttackLab />} />
        {labs.map(([slug, title]) => (
          <Route
            key={slug}
            path={"/attack-lab/" + slug}
            element={
              <Placeholder
                title={title}
                description="Trang giới thiệu chủ đề đang được chuẩn bị."
              />
            }
          />
        ))}
        <Route
          path="*"
          element={
            <>
              <Placeholder
                title="404 · Không tìm thấy trang"
                description="Đường dẫn này không có trong ứng dụng."
              />
              <Link className="mt-4 inline-block text-primary" to="/">
                Về tổng quan
              </Link>
            </>
          }
        />
      </Route>
    </Routes>
  );
}
