import React from 'react';
import './CategoriesSection.css';

const CategoriesSection = () => {
  const categories = [
    {
      name: 'Medicine',
      image: 'https://assets.pharmeasy.in/apothecary/images/medicine_ff.webp?dim=256x0',
      offer: 'SAVE 23%'
    },
    {
      name: 'Doctor Consult',
      image: 'https://assets.pharmeasy.in/web-assets/images/icon_doc_consult_tile.webp?dim=256x0:',
      offer: ''
    },
    {
      name: 'Healthcare',
      image: 'https://assets.pharmeasy.in/apothecary/images/healthcare_ff.webp?dim=256x0',
      offer: 'UPTO 60% OFF'
    },
    {
      name: 'Offers',
      image: 'https://assets.pharmeasy.in/apothecary/images/offers_ff.webp?dim=256x0',
      offer: ''
    },
    {
      name: 'Value Store',
      image: 'https://assets.pharmeasy.in/apothecary/images/value_store.png?dim=256x0',
      offer: 'UPTO 50% OFF'
    },
    {
      name: 'Diet Plan',
      image: 'https://assets.pharmeasy.in/apothecary/images/healthcare_ff.webp?dim=256x0',
      offer: 'PERSONALIZED'
    }
  ];

  const diseases = [
    {
      name: 'Cardiovascular',
      icon: '❤️',
      offer: 'HEART HEALTH'
    },
    {
      name: 'Diabetes',
      icon: '🩸',
      offer: 'BLOOD SUGAR'
    },
    {
      name: 'Respiratory',
      icon: '🫁',
      offer: 'LUNG CARE'
    }
  ];

  return (
    <section className="categories-section">
      <div className="container">
        {/* Category Shortcuts */}
        <div className="category-shortcuts">
          {categories.map((category, index) => (
            <div key={index} className="category-item">
              <div className="category-icon">
                <img src={category.image} alt={category.name} className="category-img" />
              </div>
              <div className="category-name">{category.name}</div>
              {category.offer && <div className="category-offer">{category.offer}</div>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Diseases Section */}
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Diseases</h2>
        </div>
        <div className="category-shortcuts">
          {diseases.map((disease, index) => (
            <div key={index} className="category-item">
              <div className="category-icon">{disease.icon}</div>
              <div className="category-name">{disease.name}</div>
              <div className="category-offer">{disease.offer}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
