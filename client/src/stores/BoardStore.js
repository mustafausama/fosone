import RestaurantSET from "../components/restaurant/RestaurantSET";
import OrderBoard from "../components/restaurant/OrderBoard";
import CategorySET from "../components/category/CategorySET";
import RestaurantList from "../components/restaurant/RestaurantList";
import RestaurantPage from "../components/restaurant/RestaurantPage";
import MenuSET from "../components/restaurant/MenuSET";

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
      "/restaurants": {
        "/": {
          label: "Restaurants",
          component: RestaurantList,
          permission: "RES_FIND",
        },
      },
      "/restaurants/:resID": {
        "/": {
          component: RestaurantPage,
          permission: "RES_FIND",
        },
      },
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
      "/menu": {
        "/": {
          label: "New Menu",
          component: MenuSET,
          permission: "RES_NEW",
        },
      },
      "/menu/:menuID": {
        "/": {
          component: MenuSET,
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
