import { Ticket } from "../ticket";

describe('Concurrency control', () => {
  it('Test to see if optimistic concurrency control is implemented.', async () => {
    const ticket = Ticket.build({
      title: 'Ticket A',
      price: 20,
      userId: '123'
    });

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance!.set({ price: 30 });
    secondInstance!.set({ price: 10 });

    await firstInstance!.save();

    try {
      await secondInstance!.save();
    } catch (err) {
      return;
    }

    throw new Error('Should not reach this point.');
  });

  it('Increments the version number on multiple saves.', async () => {
    const ticket = Ticket.build({
      title: 'Ticket A',
      price: 30,
      userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
  });
});
