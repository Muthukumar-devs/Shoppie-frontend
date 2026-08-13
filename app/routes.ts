import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("components/layout/MainLayout.tsx", [
    index("routes/home.tsx"),
    route("products", "routes/products/index.tsx"),
    route("products/:id", "routes/products/detail.tsx"),
    route("cart", "routes/cart/index.tsx"),
    route("checkout", "routes/checkout/index.tsx"),
    route("orders", "routes/orders/index.tsx"),
    route("profile", "routes/profile/index.tsx"),
  ]),
  route("login", "routes/auth/login.tsx"),
  route("signup", "routes/auth/signup.tsx"),
  route("verify", "routes/auth/verify.tsx"),
] satisfies RouteConfig;
