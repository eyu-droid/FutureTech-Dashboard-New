import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";
import axiosInstance from "./lib/axiosinstance";


const AdminRoutes = [
  route('/dashboard/home', 'routes/dashboardhome.tsx'),
  route('/dashboard/checkin', 'routes/checkin/index.tsx'),
  route('/dashboard/submission/ngo', 'routes/submissions/ngo/index.tsx'),
  route('/dashboard/submission/localcompany', 'routes/submissions/localcompany/index.tsx'),
  route('/dashboard/submission/internationalcompany', 'routes/submissions/internationalcompany/index.tsx'),
  route('/dashboard/submission/embassies', 'routes/submissions/embassy/index.tsx'),
  route('/dashboard/submission/startups', 'routes/submissions/startup/index.tsx'),
  route('/dashboard/submission/event', 'routes/submissions/event/index.tsx'),
  route('/dashboard/submission/conference', 'routes/submissions/conference/index.tsx'),
  route('/dashboard/partners', 'routes/partners/index.tsx'),
  route("/dashboard/attendees", "routes/attendees/index.tsx"),
  route('/dashboard/messages', 'routes/message/index.tsx'),
  route('/dashboard/users', "routes/users/index.tsx"),
]

const Marketing = [
  route('/dashboard/home', 'routes/dashboardhome.tsx'),
  route('/dashboard/submission/ngo', 'routes/submissions/ngo/index.tsx'),
  route('/dashboard/submission/localcompany', 'routes/submissions/localcompany/index.tsx'),
  route('/dashboard/submission/internationalcompany', 'routes/submissions/internationalcompany/index.tsx'),
  route('/dashboard/submission/embassies', 'routes/submissions/embassy/index.tsx'),
  route('/dashboard/submission/startups', 'routes/submissions/startup/index.tsx'),
  route('/dashboard/submission/event', 'routes/submissions/event/index.tsx'),
  route('/dashboard/submission/conference', 'routes/submissions/conference/index.tsx'),
  route('/dashboard/partners', 'routes/partners/index.tsx'),
  route('/dashboard/messages', 'routes/message/index.tsx'),

];

const Ticketer = [
  route('/dashboard/home', 'routes/dashboardhome.tsx'),
  route('/dashboard/checkin', 'routes/checkin/index.tsx'),
  route("/dashboard/attendees", "routes/attendees/index.tsx"),
]
function roleBasedRoute() {
  const user = {
    role: 3
  }
  console.log(user)
  if (user.role === 3) {
    return AdminRoutes;
  } else if (user?.role === 5) {
    return Marketing;
  } else if (user?.role === 6) {
    return Ticketer;
  } else {
    return [];
  }
}


export default [
  index("routes/home.tsx"),
  layout("layouts/auth.tsx", [
    route("/login", "routes/login.tsx"),
    route("/forgot-password", "routes/forgetpassword.tsx"),
    route("/reset-password/:param", "routes/resetpassword.tsx"),
  ]),

  layout('layouts/dashboard.tsx', [

        route('/dashboard/home', 'routes/dashboardhome.tsx'),
        route('/dashboard/checkin', 'routes/checkin/index.tsx'),
        route('/dashboard/submission/ngo', 'routes/submissions/ngo/index.tsx'),
        route('/dashboard/submission/localcompany', 'routes/submissions/localcompany/index.tsx'),
        route('/dashboard/submission/internationalcompany', 'routes/submissions/internationalcompany/index.tsx'),
        route('/dashboard/submission/embassies', 'routes/submissions/embassy/index.tsx'),
        route('/dashboard/submission/startups', 'routes/submissions/startup/index.tsx'),
        route('/dashboard/submission/event', 'routes/submissions/event/index.tsx'),
        route('/dashboard/submission/conference', 'routes/submissions/conference/index.tsx'),
        route('/dashboard/partners', 'routes/partners/index.tsx'),
        route("/dashboard/attendees", "routes/attendees/index.tsx"),
        route('/dashboard/messages', 'routes/message/index.tsx'),
        route("/dashboard/menus", "routes/menu/create/index.tsx"),

        route('/dashboard/users', "routes/users/index.tsx"),
        route('/dashboard/roles', "routes/roles/index.tsx")
    ]),

  layout("layouts/checkout.tsx", [
    route("checkout", "routes/checkout.tsx"),
    route("checkout/completed", "routes/completed.tsx"),
  ]),
] satisfies RouteConfig;
