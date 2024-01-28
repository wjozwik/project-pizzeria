import {classNames, select, settings, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.selectedTable = [];

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey   + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events   + '?' + params.eventsRepeat.join('&'),
    };
    // console.log('urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ]) 
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ])
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
        
      }
      
    }

    console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      // console.log('hourBlock', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    // console.log('thisBooking.date', thisBooking.date);
    // console.log('thisBooking.hourPicker.value', thisBooking.hourPicker.value);
    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      thisBooking.selectedTable = [];
      table.classList.remove(classNames.booking.tableSelected);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesWrapper);

    thisBooking.dom.peopleInput = thisBooking.dom.peopleAmount.querySelector(select.widgets.amount.input);
    thisBooking.dom.hoursInput = thisBooking.dom.hoursAmount.querySelector(select.widgets.amount.input);
    thisBooking.dom.phoneInput = thisBooking.dom.wrapper.querySelector(select.booking.phoneInput);
    thisBooking.dom.addressInput = thisBooking.dom.wrapper.querySelector(select.booking.addressInput);
    thisBooking.dom.starterCheckboxes = thisBooking.dom.wrapper.querySelectorAll(select.booking.starterCheckbox);
    thisBooking.dom.bookTableBtn = thisBooking.dom.wrapper.querySelector(select.booking.bookTableBtn);
    // console.log('test', thisBooking.dom.peopleAmount, thisBooking.dom.hoursAmount);
    // console.log('test', thisBooking.dom);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.date);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hour);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.tablesWrapper.addEventListener('click', function(event) {
      thisBooking.initTables(event);
    });
    thisBooking.dom.bookTableBtn.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });

  }

  initTables(event){
    const thisBooking = this;
    const tableId = event.target.getAttribute(settings.booking.tableIdAttribute);
    // console.log('event.target', event.target.getAttribute(settings.booking.tableId));

    if(
      event.target.classList.contains(classNames.booking.table) &&
      !event.target.classList.contains(classNames.booking.tableBooked) &&
      !event.target.classList.contains(classNames.booking.tableSelected)
      ){
        for(let table of thisBooking.dom.tables){
          table.classList.remove(classNames.booking.tableSelected);
        }
        thisBooking.selectedTable = [];
        thisBooking.selectedTable.push(tableId);
        event.target.classList.add(classNames.booking.tableSelected);
      } else if(
        event.target.classList.contains(classNames.booking.table) &&
        !event.target.classList.contains(classNames.booking.tableBooked) &&
        event.target.classList.contains(classNames.booking.tableSelected) &&
        thisBooking.selectedTable.includes(tableId)
      ){
        thisBooking.selectedTable = [];
        event.target.classList.remove(classNames.booking.tableSelected);
      } else if(
        event.target.classList.contains(classNames.booking.table) &&
        event.target.classList.contains(classNames.booking.tableBooked)
      ){
      alert('We are sorry, but this table is already booked.');
    }
    console.log('thisBooking.selectedTable', thisBooking.selectedTable);
    console.log(thisBooking.dom.phoneInput.value);
    console.log(thisBooking.dom.addressInput.value);
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;
    let tableNumber = null;

    if(thisBooking.selectedTable.length != 0){
      tableNumber = thisBooking.selectedTable[0];
    }


    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hourPicker.value,
      table: parseInt(tableNumber),
      duration: parseInt(thisBooking.dom.hoursInput.value),
      ppl: parseInt(thisBooking.dom.peopleInput.value),
      starters: [],
      phone: thisBooking.dom.phoneInput.value,
      address: thisBooking.dom.addressInput.value,
    }
      
    for(let starter of thisBooking.dom.starterCheckboxes) {
      if(starter.checked)
      payload.starters.push(starter.value);
    }

    console.log('thisCart.payload', payload)

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
    .then(function(response){
      return response.json();
    }).then(function(parsedResponse){
      console.log('parsedResponse', parsedResponse);

      thisBooking.makeBooked(
        parsedResponse.date,
        parsedResponse.hour,
        parsedResponse.duration,
        parsedResponse.table
      );

      console.log('thisBooking.booked', thisBooking.booked);
    });
  }
}

export default Booking;