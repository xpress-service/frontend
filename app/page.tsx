import Image from "next/image";
import styles from "./sass/landingpage/landingpage.module.scss";
import Header from "./landingpagecomponent/LandingPageHeader";
import Footer from "./landingpagecomponent/LandingPageFooter";

export default function LandinPage() {
  return (
    <div className={styles.Container}>
      <header>
        <Header />
      </header>
      <section>
        <main>
          <div className={styles.infoContainer}>
            <p>grow your business now with our on-demand platform</p>
            <p>delivery | book Enjoy service near you.</p>
          </div>
          <div>
            <Image
              src="/deliveryman.svg"
              alt="image"
              width={550}
              height={500}
            />
          </div>
        </main>
      </section>

      <section className={styles.section_two}>
        <main>
          <div className={styles.oderItems}>
            <h3>How we work</h3>
            <p>
              Get to know the policy about our services, and the brief narration
              on how it help to solve societal problem
            </p>
          </div>
          <div className={styles.services}>
            <div className={styles.store}>
              {/* */}
              <div className={styles.store_icon}>
                <Image src="/store.svg" alt="icon" width={20} height={20} />
              </div>
              <p>Connect your Store</p>
              <p>
                It s a business model that enables the buying and selling of
                goods and services over the internet.
              </p>
            </div>

            <div className={styles.render}>
              <div className={styles.render_icon}>
                <Image src="/render.svg" alt="icon" width={20} height={20} />
              </div>
              <p>Sell Product/Render Service</p>
              <p>
                A business model that enables the buying and selling of goods
                and services over the internet.
              </p>
            </div>

            <div className={styles.menu_order}>
              {/* */}
              <div className={styles.menu_order_icon}>
                <Image
                  src="/menu-order.svg"
                  alt="icon"
                  width={20}
                  height={20}
                />
              </div>
              <p>Book/Order</p>
              <p>Web based mechanism that facilitates Ordering by Customer</p>
            </div>

            <div className={styles.octicon}>
              {/* */}
              <div className={styles.icon_completed}>
                <Image
                  src="/octicon-completed.svg"
                  alt="icon"
                  width={20}
                  height={20}
                />
              </div>
              <p>Order Complete</p>
              <p>the clarify that the order is completed in process line.</p>
            </div>

            <div className={styles.delivery}>
              {/* */}
              <div className={styles.delivery_icon}>
                <Image src="/delivery.svg" alt="icon" width={20} height={20} />
              </div>
              <p>Wait for delivery</p>
              <p>
                It express that the request made from order will be deliver
                soon, as it await to get delivered.
              </p>
            </div>
          </div>
        </main>
      </section>

      <section className={styles.section_three}>
        <main>
          <div className={styles.serviceContainer}>
            <Image src="/man.svg" alt="image" width={450} height={450} />
            <div className={styles.rightSide}>
              <h3>Order service anywhere</h3>
              <div className={styles.rightItems}>
                <div className={styles.items}>
                  <div>
                    <Image
                      src="/services/mechanic.svg"
                      alt="image"
                      width={100}
                      height={100}
                    />
                    <p className={styles.title}>Find A Mechanic</p>
                    <p>
                      Acess a skilled worker who repairs and maintains vehicle
                      engines and other machinery.
                    </p>
                  </div>

                  <div>
                    <Image
                      src="/services/laundry.svg"
                      alt="image"
                      width={100}
                      height={100}
                    />
                    <p className={styles.title}>Dry Cleaning Service</p>
                    <p>
                      the washing of clothing and other textiles, and, more
                      broadly, their drying and ironing as well.
                    </p>
                  </div>

                  <div>
                    <Image
                      src="/services/tutor.svg"
                      alt="image"
                      width={100}
                      height={100}
                    />
                    <p className={styles.title}>Home Tutors</p>
                    <p>it is a form of tutoring that occurs in the home</p>
                  </div>
                </div>

                <div className={styles.items}>
                  <div>
                    <Image
                      src="/services/fastfood.svg"
                      alt="image"
                      width={100}
                      height={100}
                    />
                    <p className={styles.title}>Order Fast Food</p>
                    <p>
                      Order easily prepared processed food served in snack bars
                      and restaurants as a quick meal or to be taken away.
                    </p>
                  </div>

                  <div>
                    <Image
                      src="/services/hairdressing.svg"
                      alt="image"
                      width={100}
                      height={100}
                    />
                    <p className={styles.title}>Hair Dressing</p>
                    <p>
                      Having access to a person who cuts and styles hair as an
                      occupation.
                    </p>
                  </div>

                  <div>
                    <Image
                      src="/services/vert.svg"
                      alt="image"
                      width={100}
                      height={100}
                    />
                    <p className={styles.title}>Veterinary Service</p>
                    <p>
                      relating to the diseases, injuries, and treatment of farm
                      and domestic animals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>

      <section className={styles.usersContainer}>
        <main>
          <div className={styles.usersbox}>
            <div>
              <h3>Comment from past users</h3>
              <p className={styles.text}>An expression of opinion either in speech or writing The most frequent comment was that service was fast, A comment is a remark or observation that expresses a person's observation or criticism. To comment is to make such a remark.</p>
            </div>
            <div className={styles.partsContainer}>
              <div className={styles.leftpart}>
                <Image
                  src="/users/Ellipse 33.svg"
                  alt="img"
                  width={60}
                  height={60}
                  className={styles.user1}
                />
                <Image
                  src="/users/Ellipse 34.svg"
                  alt="img"
                  width={60}
                  height={60}
                  className={styles.user2}
                />
                <Image
                  src="/users/Ellipse 24.svg"
                  alt="img"
                  width={60}
                  height={60}
                  className={styles.user3}
                />
                <Image
                  src="/users/Ellipse 33.svg"
                  alt="img"
                  width={60}
                  height={60}
                  className={styles.user4}
                />
                <Image
                  src="/users/Ellipse 24.svg"
                  alt="img"
                  width={60}
                  height={60}
                  className={styles.user5}
                />
              </div>
              <div className={styles.rightpart}>
                <p className={styles.name}>Godwin George</p>
                <p className={styles.profession}>Farmer</p>
                <p className={styles.comment}>ServiceXpress is a productive website, which has help me to get qucik access to car repairer when my car broke down at the middle of a journey. </p>
              </div>
            </div>
          </div>
        </main>
      </section>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
