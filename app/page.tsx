import Image from "next/image";
import Link from "next/link";
import styles from "./sass/landingpage/landingpage.module.scss";
import Header from "./landingpagecomponent/LandingPageHeader";
import Footer from "./landingpagecomponent/LandingPageFooter";

export default function LandingPage() {
  return (
    <div className={styles.Container}>
      <header>
        <Header />
      </header>
      <div className={styles.content_wrapper}>
        {/* Hero Section */}
        <section className={styles.hero_section}>
          <main>
            <div className={styles.infoContainer}>
              <h1 className={styles.hero_title}>
                Grow Your Business with Our On-Demand Platform
              </h1>
              <p className={styles.hero_subtitle}>
                Connect with local service providers and customers instantly. 
                From food delivery to home services - we've got you covered.
              </p>
              <div className={styles.hero_buttons}>
                <Link href="/sign-up">
                  <button className={styles.primary_btn}>Get Started</button>
                </Link>
                <Link href="/servicelist">
                  <button className={styles.secondary_btn}>Explore Services</button>
                </Link>
              </div>
              <div className={styles.hero_stats}>
                <div className={styles.stat_item}>
                  <span className={styles.stat_number}>10K+</span>
                  <span className={styles.stat_label}>Happy Customers</span>
                </div>
                <div className={styles.stat_item}>
                  <span className={styles.stat_number}>500+</span>
                  <span className={styles.stat_label}>Service Providers</span>
                </div>
                <div className={styles.stat_item}>
                  <span className={styles.stat_number}>50+</span>
                  <span className={styles.stat_label}>Cities Covered</span>
                </div>
              </div>
            </div>
            <div className={styles.bannerContent}>
              <div className={styles.bannerItem}>
                <div className={styles.service_card}>
                  <Image
                    src="/deliveryman.svg"
                    alt="Food delivery service - Order your favorite meals"
                    width={300}
                    height={300}
                    className={styles.bannerImg}
                  />
                  <h3>Food Delivery</h3>
                  <p>Order your favorite meals from local restaurants</p>
                </div>
              </div>

              <div className={styles.bannerItem}>
                <div className={styles.service_card}>
                  <Image
                    src="/mechanic.PNG"
                    alt="Auto repair service - Professional mechanics near you"
                    width={300}
                    height={300}
                    className={styles.bannerImg}
                  />
                  <h3>Auto Repair</h3>
                  <p>Professional mechanics available 24/7</p>
                </div>
              </div>

              <div className={styles.bannerItem}>
                <div className={styles.service_card}>
                  <Image
                    src="/vert.jpg"
                    alt="Veterinary service - Professional pet care"
                    width={300}
                    height={300}
                    className={styles.bannerImg}
                  />
                  <h3>Pet Care</h3>
                  <p>Professional veterinary services for your pets</p>
                </div>
              </div>

              <div className={styles.bannerItem}>
                <div className={styles.service_card}>
                  <Image
                    src="/tutor.PNG"
                    alt="Tutoring service - Expert tutors for all subjects"
                    width={300}
                    height={300}
                    className={styles.bannerImg}
                  />
                  <h3>Tutoring</h3>
                  <p>Expert tutors for all subjects and levels</p>
                </div>
              </div>
            </div>
          </main>
        </section>

        {/* How It Works Section */}
        <section className={styles.section_two}>
          <main>
            <div className={styles.sectionHeader}>
              <h2>How ServiceXpress Works</h2>
              <p>
                Experience seamless service booking with our simple 4-step process. 
                From browsing to completion, we make it easy for you.
              </p>
            </div>
            <div className={styles.process_timeline}>
              <div className={styles.process_step}>
                <div className={styles.step_number}>1</div>
                <div className={styles.step_icon}>
                  <Image src="/store.svg" alt="Browse services icon" width={24} height={24} />
                </div>
                <h3>Browse Services</h3>
                <p>
                  Explore our wide range of services from trusted local providers 
                  in your area with transparent pricing and reviews.
                </p>
              </div>

              <div className={styles.process_step}>
                <div className={styles.step_number}>2</div>
                <div className={styles.step_icon}>
                  <Image src="/menu-order.svg" alt="Book service icon" width={24} height={24} />
                </div>
                <h3>Book & Pay</h3>
                <p>
                  Select your preferred service, choose date and time, 
                  and make secure payments through our platform.
                </p>
              </div>

              <div className={styles.process_step}>
                <div className={styles.step_number}>3</div>
                <div className={styles.step_icon}>
                  <Image src="/render.svg" alt="Service delivery icon" width={24} height={24} />
                </div>
                <h3>Get Service</h3>
                <p>
                  Professional service providers arrive at your location 
                  with all necessary tools and expertise.
                </p>
              </div>

              <div className={styles.process_step}>
                <div className={styles.step_number}>4</div>
                <div className={styles.step_icon}>
                  <Image src="/octicon-completed.svg" alt="Service completed icon" width={24} height={24} />
                </div>
                <h3>Rate & Review</h3>
                <p>
                  Service completed! Rate your experience and help others 
                  make informed decisions about service providers.
                </p>
              </div>
            </div>
          </main>
        </section>

        {/* Featured Services Section */}
        <section className={styles.section_three}>
          <main>
            <div className={styles.serviceContainer}>
              <div className={styles.leftSide}>
                <Image 
                  src="/man.svg" 
                  alt="Professional service provider ready to help" 
                  width={450} 
                  height={450} 
                  className={styles.landingImage}
                />
                <div className={styles.image_overlay}>
                  <div className={styles.overlay_content}>
                    <h3>24/7 Available</h3>
                    <p>Professional services at your fingertips</p>
                  </div>
                </div>
              </div>
              <div className={styles.rightSide}>
                <div className={styles.services_header}>
                  <h2>Premium Services Across All Categories</h2>
                  <p>Discover our comprehensive range of professional services, all vetted and rated by our community.</p>
                </div>
                <div className={styles.services_grid}>
                  <div className={styles.service_card_featured}>
                    <div className={styles.service_icon}>
                      <Image
                        src="/services/mechanic.svg"
                        alt="Auto repair service"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.service_content}>
                      <h3>Auto Repair</h3>
                      <p>Expert mechanics for all vehicle types. Emergency roadside assistance available.</p>
                      <div className={styles.service_features}>
                        <span>• 24/7 Emergency</span>
                        <span>• Certified Mechanics</span>
                        <span>• Warranty Included</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.service_card_featured}>
                    <div className={styles.service_icon}>
                      <Image
                        src="/services/laundry.svg"
                        alt="Laundry and dry cleaning service"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.service_content}>
                      <h3>Laundry & Dry Cleaning</h3>
                      <p>Professional cleaning services with pickup and delivery. Eco-friendly options available.</p>
                      <div className={styles.service_features}>
                        <span>• Free Pickup</span>
                        <span>• Same Day Service</span>
                        <span>• Eco-Friendly</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.service_card_featured}>
                    <div className={styles.service_icon}>
                      <Image
                        src="/services/tutor.svg"
                        alt="Professional tutoring service"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.service_content}>
                      <h3>Expert Tutoring</h3>
                      <p>Qualified tutors for all subjects and levels. Online and in-person sessions available.</p>
                      <div className={styles.service_features}>
                        <span>• All Subjects</span>
                        <span>• Flexible Schedule</span>
                        <span>• Progress Tracking</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.service_card_featured}>
                    <div className={styles.service_icon}>
                      <Image
                        src="/services/fastfood.svg"
                        alt="Food delivery service"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.service_content}>
                      <h3>Food Delivery</h3>
                      <p>Fast delivery from your favorite local restaurants. Track your order in real-time.</p>
                      <div className={styles.service_features}>
                        <span>• 30min Delivery</span>
                        <span>• Live Tracking</span>
                        <span>• Quality Guaranteed</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.service_card_featured}>
                    <div className={styles.service_icon}>
                      <Image
                        src="/services/hairdressing.svg"
                        alt="Professional hairdressing service"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.service_content}>
                      <h3>Beauty & Wellness</h3>
                      <p>Professional stylists and beauticians. Home salon services and spa treatments.</p>
                      <div className={styles.service_features}>
                        <span>• Home Service</span>
                        <span>• Licensed Professionals</span>
                        <span>• Premium Products</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.service_card_featured}>
                    <div className={styles.service_icon}>
                      <Image
                        src="/services/vert.svg"
                        alt="Veterinary service"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.service_content}>
                      <h3>Pet Care</h3>
                      <p>Comprehensive veterinary services for all pets. Emergency care and routine checkups.</p>
                      <div className={styles.service_features}>
                        <span>• Emergency Care</span>
                        <span>• Home Visits</span>
                        <span>• All Pet Types</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.services_cta}>
                  <Link href="/servicelist">
                    <button className={styles.explore_btn}>Explore All Services</button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </section>

        {/* Testimonials Section */}
        <section className={styles.testimonials_section}>
          <main>
            <div className={styles.testimonials_header}>
              <h2>What Our Customers Say</h2>
              <p>Join thousands of satisfied customers who trust ServiceXpress for their daily needs</p>
            </div>
            
            <div className={styles.testimonials_grid}>
              <div className={styles.testimonial_card}>
                <div className={styles.testimonial_rating}>
                  ⭐⭐⭐⭐⭐
                </div>
                <p className={styles.testimonial_text}>
                  "ServiceXpress saved my day! When my car broke down in the middle of nowhere, 
                  I found a mechanic within minutes. Fast, reliable, and professional service."
                </p>
                <div className={styles.testimonial_author}>
                  <Image
                    src="/users/Ellipse 33.svg"
                    alt="Godwin George profile"
                    width={50}
                    height={50}
                    className={styles.author_avatar}
                  />
                  <div className={styles.author_info}>
                    <p className={styles.author_name}>Godwin George</p>
                    <p className={styles.author_role}>Business Owner</p>
                  </div>
                </div>
              </div>

              <div className={styles.testimonial_card}>
                <div className={styles.testimonial_rating}>
                  ⭐⭐⭐⭐⭐
                </div>
                <p className={styles.testimonial_text}>
                  "The food delivery service is amazing! Fresh food delivered hot and on time. 
                  The app is so easy to use and the customer service is top-notch."
                </p>
                <div className={styles.testimonial_author}>
                  <Image
                    src="/users/Ellipse 34.svg"
                    alt="Sarah Johnson profile"
                    width={50}
                    height={50}
                    className={styles.author_avatar}
                  />
                  <div className={styles.author_info}>
                    <p className={styles.author_name}>Sarah Johnson</p>
                    <p className={styles.author_role}>Marketing Manager</p>
                  </div>
                </div>
              </div>

              <div className={styles.testimonial_card}>
                <div className={styles.testimonial_rating}>
                  ⭐⭐⭐⭐⭐
                </div>
                <p className={styles.testimonial_text}>
                  "Found an excellent tutor for my daughter through ServiceXpress. 
                  Her grades improved significantly. Highly recommend this platform!"
                </p>
                <div className={styles.testimonial_author}>
                  <Image
                    src="/users/Ellipse 24.svg"
                    alt="Michael Chen profile"
                    width={50}
                    height={50}
                    className={styles.author_avatar}
                  />
                  <div className={styles.author_info}>
                    <p className={styles.author_name}>Michael Chen</p>
                    <p className={styles.author_role}>Parent & Engineer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.trust_indicators}>
              <div className={styles.trust_item}>
                <h3>4.9/5</h3>
                <p>Average Rating</p>
              </div>
              <div className={styles.trust_item}>
                <h3>10,000+</h3>
                <p>Reviews</p>
              </div>
              <div className={styles.trust_item}>
                <h3>99%</h3>
                <p>Customer Satisfaction</p>
              </div>
              <div className={styles.trust_item}>
                <h3>24/7</h3>
                <p>Support Available</p>
              </div>
            </div>
          </main>
        </section>

        {/* Call to Action Section */}
        <section className={styles.cta_section}>
          <main>
            <div className={styles.cta_content}>
              <h2>Ready to Get Started?</h2>
              <p>Join ServiceXpress today and connect with thousands of service providers in your area</p>
              <div className={styles.cta_buttons}>
                <Link href="/sign-up">
                  <button className={styles.cta_primary}>Join as Customer</button>
                </Link>
                <Link href="/sign-up">
                  <button className={styles.cta_secondary}>Become a Provider</button>
                </Link>
              </div>
              <p className={styles.cta_note}>No setup fees • Cancel anytime • 24/7 support</p>
            </div>
          </main>
        </section>
      </div>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
