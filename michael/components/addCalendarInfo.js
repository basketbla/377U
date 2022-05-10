// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
import React from 'react';
import {
  View
} from 'react-native'
// import { Text, View, Button, Platform, StyleSheet, Pressable, Alert} from 'react-native';
// import * as Linking from 'expo-linking';
// import { COLORS } from '../utils/constants';
// import { useAuth } from '../contexts/AuthContext'
// import 'whatwg-fetch';
// import Scheduler from 'devextreme-react/scheduler';
// import CustomStore from 'devextreme/data/custom_store';

import {GoogleLogin} from 'react-google-login'
import axios from 'axios'

// function getData(_, requestOptions) {
//   const PUBLIC_KEY = 'AIzaSyBnNAISIUKe6xdhq1_rjor2rxoI3UlMY7k';
//   const CALENDAR_ID = 'f7jnetm22dsjc3npc2lu3buvu4@group.calendar.google.com';
//   const dataUrl = ['https://www.googleapis.com/calendar/v3/calendars/',
//     CALENDAR_ID, '/events?key=', PUBLIC_KEY].join('');

//   return fetch(dataUrl, requestOptions).then(
//     (response) => response.json(),
//   ).then((data) => data.items);
// }

// const dataSource = new CustomStore({
//   load: (options) => getData(options, { showDeleted: false }),
// });

// const currentDate = new Date(2017, 4, 25);
// const views = ['day', 'workWeek', 'month'];

const responseGoogle = response => {
  console.log(response)
  const {code} = response
  axios.post('/api/create-tokens', {code})
    .then(response => {
      console.log(response.data) 
    })
    .catch(error => console.log(error.message))
  
  // this is where checking the free/busy schedule currently is.
  // not sure if this is the best place -- imagine another way that could work better
  // is if there was a button to press tthat activates this.
  // currently, we're doing this on load
  // documentation fyi: https://developers.google.com/calendar/api/v3/reference/freebusy/query 
  axios.post('/v3/freebusy', {code})
    .then(response => {
      console.log(response.data)
    })
    .catch(error => console.log(error.message))
}

const responseError = response => {
  return console.log(response)
}

export default function AddCalendarInfo() {
  return (
    <View style={{flex: 1}}>
      <GoogleLogin clientId='454609421610-r3sa3imjglbsjnn8qorsjbbtpfcf0tpn.apps.googleusercontent.com'
        buttonText='Sign in to your Google Calendar'
        onSuccess={responseGoogle}
        onFailure={responseError}
        cookiePolicy={'single_host_origin'}
        //this is important
        responseType='code'
        accessType='offline'
        scope='openid email profile https://www.googleapis.com/auth/calendar'
      />
    </View>
    // <React.Fragment>
    //   <div className="long-title">
    //     <h3>Tasks for Employees (USA Office)</h3>
    //   </div>
    //   <Scheduler
    //     dataSource={dataSource}
    //     views={views}
    //     defaultCurrentView="workWeek"
    //     defaultCurrentDate={currentDate}
    //     height={500}
    //     startDayHour={7}
    //     editing={false}
    //     showAllDayPanel={false}
    //     startDateExpr="start.dateTime"
    //     endDateExpr="end.dateTime"
    //     textExpr="summary"
    //     timeZone="America/Los_Angeles" />
    // </React.Fragment>

  );
}