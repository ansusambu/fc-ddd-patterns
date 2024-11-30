import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),
      },
      {
        where: { id: entity.id },
      }
    );
  
    await Promise.all(
      entity.items.map((item) =>
        OrderItemModel.update(
          {
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            product_id: item.productId,
          },
          {
            where: { id: item.id },
          }
        )
      )
    );
  }

  async find(id: string): Promise<Order> {
    let orderModel;

    try {
      orderModel = await OrderModel.findOne({
        where: {
          id
        },
        include: [{
          model: OrderItemModel, 
          as: "items",
        }],
        rejectOnEmpty: true
      })
    } catch (error) {
      throw new Error("Order not found")
    }

    const orderItems = orderModel.items.map((item: any) => 
      new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
    );

    return new Order(orderModel.id, orderModel.customer_id, orderItems)
  }

  async findAll(): Promise<Order[]> {
    const ordersModels = await OrderModel.findAll({
      include: [{
        model: OrderItemModel,
        as: "items",
      }],
    });
  
    return ordersModels.map((orderModel: any) => {
      const items = orderModel.items.map((item: any) =>
        new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
      );
  
      return new Order(orderModel.id, orderModel.customer_id, items);
    });
  }
}
