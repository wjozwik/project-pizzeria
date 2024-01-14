import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();

  }

  render(container){
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = container;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.date = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hour = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    // console.log('test', thisBooking.dom.peopleAmount, thisBooking.dom.hoursAmount);
    // console.log('test', thisBooking.dom);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.date = new DatePicker(thisBooking.dom.date);
    thisBooking.hour = new HourPicker(thisBooking.dom.hour);

    thisBooking.dom.peopleAmount.addEventListener('updated', function() {
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function() {
    });

  }
}

export default Booking;