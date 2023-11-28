import React, {useEffect, useState, useCallback} from 'react';
import axios from 'axios';

import './App.css';

import List from './Components/List/List';
import Navbar from './Components/Navbar/Navbar';

function App() {
  const statusList = ['In progress', 'Backlog', 'Todo', 'Done', 'Cancelled']
  const userList = ['Anoop sharma', 'Yogesh', 'Shankar Kumar', 'Ramesh', 'Suresh']
  const priorityList = [{name:'No priority', priority: 0}, {name:'Low', priority: 1}, {name:'Medium', priority: 2}, {name:'High', priority: 3}, {name:'Urgent', priority: 4}]

  const [groupValue, setGroupValue] = useState(getStateFromLocalStorage() || 'status')
  const [orderValue, setOrderValue] = useState('title')
  const [ticketDetails, setTicketDetails] = useState([]);

  // using use callback to memoize states
  // only re render on orderValue and setTicketDetails
  const orderDataByValue = useCallback(async (cards) => {
    if (orderValue === 'priority') {
      cards.sort((a, b) => b.priority > a.priority);
    } else if (orderValue === 'title') {
      cards.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        if (titleA < titleB) {
          return -1;
        } else if (titleA > titleB) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    await setTicketDetails(cards);
  }, [orderValue, setTicketDetails]);

  function saveStateToLocalStorage(state) {
    localStorage.setItem('groupValue', JSON.stringify(state));
  }

  function getStateFromLocalStorage() {
    const storedState = localStorage.getItem('groupValue');
    if (storedState) {
      return JSON.parse(storedState);
    }
    return null; 
  }

  useEffect(() => {
    saveStateToLocalStorage(groupValue);
    async function fetchData() {
      const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
      await mapUserToTask(response);
  
    }
    fetchData();
    async function mapUserToTask(response){
      let ticketArray = []
      let req_data = response.data
        if(response.status  === 200){
          req_data.tickets.map((ticket) => {
            req_data.users.map((user) => {
              if(ticket.userId === user.id){
                let ticketJson = {...ticket, userObj : user}
                ticketArray.push(ticketJson)
                console.log(ticketJson)
              }
            })
          })
        }
      await setTicketDetails(ticketArray)
      orderDataByValue(ticketArray)
    }
    
  }, [orderDataByValue, groupValue])

  function handleGroupValue(value){
    setGroupValue(value);
  }

  function handleOrderValue(value){
    setOrderValue(value);
  }
  
  return (
    <>
      <Navbar
        groupValue={groupValue}
        orderValue={orderValue}
        handleGroupValue={handleGroupValue}
        handleOrderValue={handleOrderValue}
      />
      <section className="board-details">
        <div className="board-details-list">
          {
            {
              'status' : <>
                {
                  statusList.map((item) => {
                    return(<List
                      groupValue='status'
                      orderValue={orderValue}
                      listTitle={item}
                      listIcon=''
                      statusList={statusList}
                      ticketDetails={ticketDetails}
                    />)
                  })
                }
              </>,
              'user' : <>
              {
                userList.map((item) => {
                  return(<List
                    groupValue='user'
                    orderValue={orderValue}
                    listTitle={item}
                    listIcon=''
                    userList={userList}
                    ticketDetails={ticketDetails}
                  />)
                })
              }
              </>,
              'priority' : <>
              {
                priorityList.map((item) => {
                  return(<List
                    groupValue='priority'
                    orderValue={orderValue}
                    listTitle={item.priority}
                    listIcon=''
                    priorityList={priorityList}
                    ticketDetails={ticketDetails}
                  />)
                })
              }
            </>
            }[groupValue]
          }
        </div>
      </section>
    </>
  );
}

export default App;
