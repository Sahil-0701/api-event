import mongoose from 'mongoose';
import eventModel from './models/eventModel.js';


async function updateEvents() {
  await mongoose.connect('mongodb+srv://kaushiksr712:Github%400701@cluster0.llml6k8.mongodb.net/?retryWrites=true&w=majority');

  const events = await eventModel.find({});
  for (const event of events) {
    event.availableSeats = event.totalSeats;
    event.totalBookings = 0;
    event.revenue = 0;
    await event.save();
  }

  console.log('Events updated!');
  process.exit();
}

updateEvents().catch(console.error);
