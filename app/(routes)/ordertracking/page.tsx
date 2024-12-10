"use client";
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/app/_layoutcomponents/DefaultLayout";
import styles from "../../sass/tracking/tracking.module.scss";
import { MdInsertLink } from "react-icons/md";
import { GrCompliance } from "react-icons/gr";
import { SlLink } from "react-icons/sl";
import { GrLocation } from "react-icons/gr";

const Tracking = () => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep < 3 ? prevStep + 1 : 1));
    }, 2000); // Change step every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <DefaultLayout>
      <div className={styles.trackContainer}>
        <div className={styles.Order}>
            <div className={styles.leftOrder}>
                <h3>Order 1</h3>
                <p>Vendor: Twins Faja food</p>
                <p>Request: Fast Food</p>
            </div>
            <div className={styles.rightOrder}>
                
                <div className={styles.icon_par}> 
                    <GrLocation size={12}/>
                    <p>Lagos, Nigeria</p>
                    </div>
                <p>Tracking ID: 48746AD</p>
            </div>
        </div>
        <div className={styles.progress_container}>
          <div className={styles.progress_bar}>
            <div
              className={styles.progress}
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>
         
          <div className={styles.steps}>
            <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
              <div className={styles.circle}>
              <SlLink size={14}/>
               
              </div>
              <div className={styles.label}>Preparation</div>
            </div>
            <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
              <div className={styles.circle}>
              <MdInsertLink size={14}/>
              </div>
              <div className={styles.label}>In Progress</div>
            </div>
            <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
              <div className={styles.circle}>
              <GrCompliance size={14}/>
              </div>
              <div className={styles.label}>Completed</div>
            </div>
          </div>
          </div>
        </div>

        <div className={styles.complainbox}>
          <p>Do you have any complain?</p>
          <div className={styles.complainbtns}>
            <button>Yes</button>
            <button>No</button>
          </div>
        </div>
      </div>



      <div className={styles.trackContainer}>
        <div className={styles.Order}>
            <div className={styles.leftOrder}>
                <h3>Order 2</h3>
                <p>Vendor: Twins Faja food</p>
                <p>Request: Fast Food</p>
            </div>
            <div className={styles.rightOrder}>
                
                <div className={styles.icon_par}> 
                    <GrLocation size={12}/>
                    <p>Lagos, Nigeria</p>
                    </div>
                <p>Tracking ID: 48746AD</p>
            </div>
        </div>
        <div className={styles.progress_container}>
          <div className={styles.progress_bar}>
            <div
              className={styles.progress}
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>
         
          <div className={styles.steps}>
            <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
              <div className={styles.circle}>
              <SlLink size={14}/>
               
              </div>
              <div className={styles.label}>Preparation</div>
            </div>
            <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
              <div className={styles.circle}>
              <MdInsertLink size={14}/>
              </div>
              <div className={styles.label}>In Progress</div>
            </div>
            <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
              <div className={styles.circle}>
              <GrCompliance size={14}/>
              </div>
              <div className={styles.label}>Completed</div>
            </div>
          </div>
          </div>
        </div>

        <div className={styles.complainbox}>
          <p>Do you have any complain?</p>
          <div className={styles.complainbtns}>
            <button>Yes</button>
            <button>No</button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Tracking;
