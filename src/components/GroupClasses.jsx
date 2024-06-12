import React from 'react';
import '../CSS/GroupClasses.css';

const GroupClasses = () => {
  return (
    <div className="group-classes-container">
      <h1 className="group-classes-header">Group Classes at Hello Belly!</h1>
      <p className="group-classes-overview">
        At Hello Belly!, we understand that pregnancy is a journey best shared with others who are going through similar experiences. That’s why we offer a range of video classes led by specialists in prenatal and postnatal care. Our group classes are designed to provide you with the knowledge, skills, and support you need during this special time.
      </p>
      <p className="group-classes-overview">
        Whether you are looking to learn about prenatal nutrition, master the art of swaddling, or practice prenatal yoga, our classes offer something for everyone. Join our community, connect with other expecting mothers, and learn from experts in a supportive, engaging environment.
      </p>
      <h1 className="group-classes-header">Please use your dashboard calendar to join at the specified times!</h1>

      <div className="class-item image-left">
        <img className="class-image" src="https://res.cloudinary.com/dhgpf6985/image/upload/v1718046727/Infant_Childcare_luttab.jpg" alt="Infant Childcare" />
        <div className="class-text">
          <h3>Infant Childcare</h3>
          <p>Our Infant Childcare class provides essential guidance on how to care for your newborn. Learn about feeding, diapering, soothing techniques, and more. This class is perfect for new parents who want to feel confident in their ability to care for their baby.</p>
        </div>
      </div>

      <div className="class-item image-right">
        <img className="class-image" src="https://res.cloudinary.com/dhgpf6985/image/upload/v1718046727/breastfeeding_h0glr9.jpg" alt="Breastfeeding" />
        <div className="class-text">
          <h3>Breastfeeding</h3>
          <p>Our Breastfeeding class offers comprehensive information on the benefits of breastfeeding, techniques for proper latch, and tips for overcoming common challenges. Join this class to receive support and encouragement as you embark on your breastfeeding journey.</p>
        </div>
      </div>

      <div className="class-item image-left">
        <img className="class-image" src="https://res.cloudinary.com/dhgpf6985/image/upload/v1718046727/prenatal_yoga_c1fxft.jpg" alt="Prenatal Yoga" />
        <div className="class-text">
          <h3>Prenatal Yoga</h3>
          <p>Our Prenatal Yoga class helps you stay active and relaxed during your pregnancy. Enjoy gentle stretches, breathing exercises, and relaxation techniques that are safe for you and your baby. Connect with your body and mind while preparing for labor and delivery.</p>
        </div>
      </div>

      <div className="class-item image-right">
        <img className="class-image" src="https://res.cloudinary.com/dhgpf6985/image/upload/v1718046727/swaddling_jf6l2n.jpg" alt="Swaddling" />
        <div className="class-text">
          <h3>Swaddling</h3>
          <p>Learn the art of swaddling in our Swaddling class. Discover how to safely and comfortably swaddle your newborn to promote better sleep and reduce fussiness. Our experts will guide you through various techniques and answer all your swaddling questions.</p>
        </div>
      </div>

      <div className="class-item image-left">
        <img className="class-image" src="https://res.cloudinary.com/dhgpf6985/image/upload/v1718046727/prenatal_nutrition_azkzzg.png" alt="Prenatal Nutrition" />
        <div className="class-text">
          <h3>Prenatal Nutrition</h3>
          <p>Join our Prenatal Nutrition class to learn about the essential nutrients needed for a healthy pregnancy. Get tips on meal planning, managing cravings, and ensuring you and your baby get the best nutrition possible.</p>
        </div>
      </div>

      <div className="class-item image-right">
        <img className="class-image" src="https://res.cloudinary.com/dhgpf6985/image/upload/v1718046906/lamaze_ytcnjg.jpg" alt="Lamaze" />
        <div className="class-text">
          <h3>Lamaze</h3>
          <p>Our Lamaze class prepares you for labor and delivery with techniques to manage pain and stay relaxed. Learn about the stages of labor, breathing techniques, and how to work with your body during childbirth. Empower yourself with knowledge and confidence.</p>
        </div>
      </div>
    </div>
  );
};

export default GroupClasses;