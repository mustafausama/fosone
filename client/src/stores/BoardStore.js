import RestaurantSET from "../components/RestaurantSET";
import OrderBoard from "../components/OrderBoard";
import CategorySET from "../components/CategorySET";

class BoardStore {
  dashboards = {
    "/home": {
      "/": { component: OrderBoard, permission: "RES_FIND" },
      "/find-res": {
        "/": {
          label: "Order Board",
          component: OrderBoard,
          permission: "RES_FIND",
        },
      },
    },
    "/account": {
      "/restaurant": {
        "/": {
          label: "New Restaurant",
          component: RestaurantSET,
          permission: "RES_NEW",
        },
      },
      "/restaurant/:resID": {
        "/": {
          component: RestaurantSET,
          permission: "RES_EDIT",
        },
      },
      "/category": {
        "/": {
          label: "New Category",
          component: CategorySET,
          permission: "CATEGORY_NEW",
        },
      },
      "/category/:catID": {
        "/": {
          component: CategorySET,
          permission: "CATEGORY_EDIT",
        },
      },
    },
  };
}

export default BoardStore;
