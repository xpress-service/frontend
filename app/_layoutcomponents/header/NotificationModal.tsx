'use client'
import React, {useState} from 'react'
import styles from '../../sass/transaction/notification.module.scss'

const message =[
    {
        id: '1',
        description: 'Your Payment for Fast food with Ikitchen Food is successful.',
        date:'February, 20 2023',
        time: '11:15am'
    },
    {
        id: '2',
        description: 'Your Payment for Fast food with Ikitchen Food is successful.',
        date:'February, 20 2023',
        time: '11:15am'
    },
    {
        id: '3',
        description: 'Your request for a Laundry service has been approved by SakLaundry Service',
        date:'February, 20 2023',
        time: '11:15am'
    },
    {
        id: '4',
        description: 'Your request for MakeUp service by The Huse of Beauty Line was declined.',
        date:'February, 20 2023',
        time: '11:15am'
    },
]
const NotificationModal = () => {
    // const [isModal, setIsModal] = (useState);

    const modalOpen = () => {
        // setIsModal()
    }

      return (
    
    <div className={styles.notice_con}>  
    <div className={styles.modal}>
        <p className={styles.notice}>Notifications</p>      
            {message.map((item, id) =>{
            return(
                <div key={id} className={styles.msg}>
                    <p>{item.description}</p>
                    <div className={styles.date_time}>
                        <p>{item.date}</p>
                        <p className={styles.notification_time}>{item.time}</p>
                    </div>
                </div>
            )
        })}
        </div>
        </div>
  )
}

export default NotificationModal