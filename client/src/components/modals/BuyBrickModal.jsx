import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const BuyBrickModal = ({
  modalPosition,
  clickedIndex,
  handleBuyBrickButtonClick,
  hideModal,
}) => {
  const modalRef = useRef(null);
  const [isFirstClick, setIsFirstClick] = useState(true);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !isFirstClick
      ) {
        hideModal();
      }
      if (isFirstClick) setIsFirstClick(false);
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [hideModal, isFirstClick]);

  return (
    <div
      className='border border-gray-600 bg-gray-200 opacity-100 absolute px-4 py-8 w-52 h-72 flex flex-col justify-center items-center z-40'
      style={{
        left: modalPosition.x,
        top: modalPosition.y,
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.7)',
      }}
      ref={modalRef}
    >
      <p className='font-lg py-2 font-bold font-montserrat'>{clickedIndex}</p>
      <p className='font-raleway pb-2'>
        Buy this Brick and Save a Life. Click on this box to dedicate your
        support and help us build a sanctuary of care for those in need.
      </p>
      <button
        className='text-gray-100 bg-red-700 px-4 py-2 rounded-md'
        onClick={handleBuyBrickButtonClick}
      >
        BUY THIS BRICK
      </button>
    </div>
  );
};

BuyBrickModal.propTypes = {
  modalPosition: PropTypes.object.isRequired,
  clickedIndex: PropTypes.string.isRequired,
  handleBuyBrickButtonClick: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
};

export default BuyBrickModal;
