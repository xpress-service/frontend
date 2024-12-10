import DefaultLayout from '@/app/_layoutcomponents/DefaultLayout'
import React from 'react'
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'
import styles from '../../sass/transaction/transaction.module.scss'
import { BiCheckbox } from 'react-icons/bi'
import { TbTransactionBitcoin } from 'react-icons/tb'
import { BsThreeDots } from 'react-icons/bs'
import { CgCalendar } from 'react-icons/cg'

const payments = [
    {
        id: '1',
        date: 'Feb 11',
        method:'Remita',
        service:'Laundry',
        status: 'approved',
        amount: '10,000'
    },
    {
        id: '2',
        date: 'Feb 14',
        method:'Remita',
        service:'Laundry',
        status: 'approved',
        amount: '10,000'
    },
    {
        id: '3',
        date: 'Feb 15',
        method:'Remita',
        service:'Laundry',
        status: 'cancel',
        amount: '10,000'
    },
    {
        id: '4',
        date: 'Feb 16',
        method:'Payday',
        service:'Laundry',
        status: 'approved',
        amount: '10,000'
    },
]
const Transaction = () => {
  return (
    <DefaultLayout>
    <div className={styles.transactionContainer}>
<section className={styles.pageHistory}>
    <div>
        <p className={styles.trans_details}>Transaction details</p>
        <p  className={styles.trans_history}>Transaction history</p>
    </div>
    <div>
    <p className={styles.pages}>Page 1 of 20</p>
    <div className={styles.arrows}>
        <div className={styles.iconcircle}>    
            <MdKeyboardArrowLeft/>
        </div>
        <div className={styles.iconcircle}> 
    <MdKeyboardArrowRight/>
    </div>

    </div>
    </div>
</section>
<section className={styles.activity}>
    <p  className={styles.trans_activity}>All Activity</p>
    <div className={styles.calenderbox}>
        <div className={styles.calender}>
        <CgCalendar size={24}/>
       <p> February 10 - February 21</p>
        </div>
    <p  className={styles.trans_clear}>Clear All</p>
    </div>
</section>

<section className={styles.paymentbox}>
    {payments.map((payment, id) => {
         let statusClass = "";
         switch (payment.status) {
           case "approved":
             statusClass = styles.statusApproved;
             break;
           
           case "cancel":
             statusClass = styles.statusCancel;
             break;
           default:
             statusClass = "";
         }
         return(
        <div key={id} className={styles.payments}>
            <div className={styles.checkbox}>
                <BiCheckbox size={24}/>
            <p>{payment.date}</p>
            </div>
            <div className={styles.checkbox}>
                <TbTransactionBitcoin size={24}/>
            <p>{payment.method}</p>
            </div>
            <div>
            <p>{payment.service}</p>
            </div>
            <div>
            <p className={statusClass}>{payment.status}</p>
            </div>
            <BsThreeDots size={16}/>
        </div>
         )
})}
</section>
    </div>
 
    </DefaultLayout>
  )
}

export default Transaction