import { format } from 'date-fns';

export const timeFromDBToUI = x => {
  
  // analyze how to handle timezone
  if (x instanceof Date) {
    return format(x, 'HH:mm');
  }

  // when we send a UTC formated date, usually comes from DB
  if (x) {
    return format(createDateTimeWithTime(x), 'HH:mm');
  }

  return x;
};

export const timeFromUIToDB = x => {
  // analyze how to handle timezone
  if (x instanceof Date) {
    return format(x, 'HH:mm');
  }

  if (x) {
    if (x.includes('T')) return format(new Date(x), 'HH:mm');

    var currentDate = new Date();
    var stringTime = x.split(':');
    
    currentDate.setHours(stringTime[0]);
    currentDate.setMinutes(stringTime[1]);

    return format(new Date(currentDate), 'HH:mm');
  }
  return x;
  // return new Date(x).toLocaleString();
}

export const createDateTimeWithTime = x => {
  if (x instanceof Date) {
    return x;
  }

  if (x) {
    var currentDate = new Date();
    var stringTime = x.split(':');
    
    currentDate.setHours(stringTime[0]);
    currentDate.setMinutes(stringTime[1]);

    return currentDate;
  }
}

export function createXDateTimeWithTime ( horario, sumDay ) {
  if (horario instanceof Date) {
    x.setDate(new Date().getDate()+sumDay); 
    return horario;
  }

  if (horario) {
    var currentDate = new Date();
    currentDate.setDate(new Date().getDate()+sumDay); 
    var stringTime = horario.split(':');
    
    currentDate.setHours(stringTime[0]);
    currentDate.setMinutes(stringTime[1]);

    return currentDate;
  }
}

// use only on places where we display date on readonly mode like grids or typography
// export const dateFromDBToUI = x => {
//   // analyze how to handle timezone
//   if (x instanceof Date) {
//     return format(x, 'yyyy-MM-dd');
//   }

//   // when we send a UTC formated date, usually comes from DB
//   if (x) {
//     return format(new Date(x), 'yyyy-MM-dd');
//   }

//   return x;
// };

// only use on readonly components
export const dateTimeFromDBToUI = x => {
  // analyze how to handle timezone
  if (x instanceof Date) {
    return format(x, 'yyyy-MM-dd HH:mm');
  }

  if (x) return format(new Date(x), 'yyyy-MM-dd HH:mm:ss');

  return x;
};

// now we are working directly with dates
export const dateFromUIToDB = x => {
  const value = x;
  // analyze how to handle timezone
  if (x instanceof Date) {
    return x.toISOString();
  }

  // maybe we are going to not use this code anymore, because we will work with dates directly
  if (value) {
    if (value.includes('T')) return x;
    // Not sure if this is the proper way to handle it
    // but the gist of it is that we add the timezone of the computer that triggers it
    const timezoneInfo = new Date().toISOString().split('T', 2)[1];
    return `${value}T${timezoneInfo}`;
  }
  return x;
};

export const addMonths = (date, months) => {
  var d = date.getDate();
  date.setMonth(date.getMonth() + +months);
  if (date.getDate() != d) {
    date.setDate(0);
  }
  return date;
}
