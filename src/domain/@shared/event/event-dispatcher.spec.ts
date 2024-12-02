import CustomerAddressChangedEvent from "../../customer/event/customer-adress-changed.event";
import CustomerCreateEvent from "../../customer/event/customer-created.event";
import EnviaConsoleLogHandler from "../../customer/event/handler/envia-console-log.handler";
import EnviaConsoleLog1Handler from "../../customer/event/handler/envia-console-log1.handler";
import EnviaConsoleLog2Handler from "../../customer/event/handler/envia-console-log2.handler";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  let eventDispatcher: EventDispatcher;

  beforeEach(() => {
    eventDispatcher = new EventDispatcher();
  })

  const eventsWithHandlers = [
    {
      eventName: "ProductCreatedEvent",
      handler: new SendEmailWhenProductIsCreatedHandler(),
      eventInstance: new ProductCreatedEvent({
        name: "Product 1",
        description: "Product 1 description",
        price: 10.0,
      }),
    },
    {
      eventName: "CustomerAddressChangedEvent",
      handler: new EnviaConsoleLogHandler(),
      eventInstance: new CustomerAddressChangedEvent({
        id: "123",
        name: "Nome",
        address: "rua teste, 123",
      }),
    },
    {
      eventName: "CustomerCreateEvent",
      handler: new EnviaConsoleLog1Handler(),
      eventInstance: new CustomerCreateEvent({})
    },
    {
      eventName: "CustomerCreateEvent",
      handler: new EnviaConsoleLog2Handler(),
      eventInstance: new CustomerCreateEvent({})
    }
  ];

  eventsWithHandlers.forEach(({ eventName, handler }) => {
    it(`should register the handler for the ${eventName}`, () => {
      eventDispatcher.register(eventName, handler);

      expect(eventDispatcher.getEventHandlers[eventName]).toBeDefined();
      expect(eventDispatcher.getEventHandlers[eventName].length).toBe(1);
      expect(eventDispatcher.getEventHandlers[eventName][0]).toMatchObject(handler);
    });
  });

  eventsWithHandlers.forEach(({ eventName, handler }) => {
    it(`should unregister the handler for the ${eventName}`, () => {
      eventDispatcher.register(eventName, handler);

      expect(eventDispatcher.getEventHandlers[eventName][0]).toMatchObject(handler);

      eventDispatcher.unregister(eventName, handler);

      expect(eventDispatcher.getEventHandlers[eventName]).toBeDefined();
      expect(eventDispatcher.getEventHandlers[eventName].length).toBe(0);
    });
  });

  eventsWithHandlers.forEach(({ eventName, handler }) => {
    it(`should unregister all event handlers`, () => {
      eventDispatcher.register(eventName, handler);

      expect(eventDispatcher.getEventHandlers[eventName][0]).toMatchObject(handler);

      eventDispatcher.unregisterAll();

      expect(eventDispatcher.getEventHandlers[eventName]).toBeUndefined();
    });
  });

  eventsWithHandlers.forEach(({ eventName, handler, eventInstance }) => {
    it(`should notify all event handlers`, () => {
      const spyEventHandler = jest.spyOn(handler, "handle");

      eventDispatcher.register(eventName, handler);

      expect(eventDispatcher.getEventHandlers[eventName][0]).toMatchObject(handler);

      eventDispatcher.notify(eventInstance);

      expect(spyEventHandler).toHaveBeenCalled()
    });
  });
});
