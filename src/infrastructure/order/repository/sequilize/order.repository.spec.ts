import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = await createCustomer("123", "Customer 1", address);
  
    const product = await createProduct("123", "Product 1", 10);

    const orderItem = new OrderItem("1", product.name, product.price, product.id, 2);

    const order = await createOrder("123", customer.id, [orderItem]);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update a order", async () => {
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = await createCustomer("123", "Customer 1", address);
  
    const product = await createProduct("123", "Product 1", 10);

    const orderItem = new OrderItem("1", product.name, product.price, product.id, 2);

    const order = await createOrder("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();

    orderItem.changeName("order item change");
    await orderRepository.update(order);
    
    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  })

  it("should find a order", async () => {
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = await createCustomer("123", "Customer 1", address);
  
    const product = await createProduct("123", "Product 1", 10);

    const orderItem = new OrderItem("1", product.name, product.price, product.id, 2);

    const order = await createOrder("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    const orderResult = await orderRepository.find(order.id);

    expect(order).toStrictEqual(orderResult);
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();

    expect(async () => {
      await orderRepository.find("456ABC");
    }).rejects.toThrow("Order not found");
  });

  it("should find all orders", async () => {
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = await createCustomer("123", "Customer 1", address);
  
    const product = await createProduct("123", "Product 1", 10);
  
    const orderItem1 = new OrderItem("1", product.name, product.price, product.id, 2);
    const orderItem2 = new OrderItem("2", product.name, product.price, product.id, 3);
  
    const order1 = await createOrder("123", customer.id, [orderItem1]);
    const order2 = await createOrder("456", customer.id, [orderItem2]);
  
    const orderRepository = new OrderRepository();

    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });

  async function createCustomer(id: string, name: string, address: Address): Promise<Customer> {
    const customerRepository = new CustomerRepository();
    const customer = new Customer(id, name);
    customer.changeAddress(address);
    await customerRepository.create(customer);
    return customer;
  }

  async function createProduct(id: string, name: string, price: number): Promise<Product> {
    const productRepository = new ProductRepository();
    const product = new Product(id, name, price);
    await productRepository.create(product);
    return product;
  }

  async function createOrder(id: string, customerId: string, items: OrderItem[]): Promise<Order> {
    const orderRepository = new OrderRepository();
    const order = new Order(id, customerId, items);
    await orderRepository.create(order);
    return order;
  }
});
