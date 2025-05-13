import {
  HomeIcon,
  UserCircleIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Analytics, Notifications, BlogEditor } from "@/pages/dashboard";
import { element } from "prop-types";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <PencilIcon {...icon} />,
        name: "write",
        path: "/newstory",
        element: <BlogEditor />,
      },
      {
        icon: <ChartBarIcon {...icon} />,
        name: "analytics",
        path: "/analytics",
        element: <Analytics />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
    ],
  },
];

export default routes;
