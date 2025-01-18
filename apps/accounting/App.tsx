import { Routes, Route, useParams, Link, Outlet } from "react-router-dom";
import { NoMatch } from "./no-match";

export default function InboxApp() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Accounting />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  return (
    <div>
      <h1>Welcome to the Inbox app!</h1>
      <nav>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/inbox">Index</a>
          </li>
        </ul>
      </nav>

      <hr />

      <Outlet />
    </div>
  );
}

export function Accounting() {
  return <div>Welcome to Accounting system</div>;
}
