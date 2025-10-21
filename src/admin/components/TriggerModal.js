import RoundedButton from "../../components/RoundedButton";
import {
  Modal,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

function TriggerModal({ buttonText, children, ...rest }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <RoundedButton onClick={onOpen}>{buttonText}</RoundedButton>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>{children}</ModalContent>
      </Modal>
    </>
  );
}

export default TriggerModal;
