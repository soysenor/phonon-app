import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
} from "@ionic/react";
import { download } from "ionicons/icons";
import { useState } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router";
import { usePairSessionMutation } from "../store/api";

export default function ReceivePhononButton() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [pairSession] = usePairSessionMutation();
  // const startScan = async () => {
  //   BarcodeScanner.hideBackground(); // make background of WebView transparent

  //   const result = await BarcodeScanner.startScan(); // start scanning and wait for a result

  //   // if the result has content
  //   if (result.hasContent) {
  //     console.log(result.content); // log the raw scanned content
  //   }
  // };
  const showModal = () => {
    setIsModalVisible(true);

    // startScan();
  };

  const hideModal = () => {
    setInputValue("");
    setIsModalVisible(false);
    setRequestPending(false);
  };

  const handleOk = async () => {
    setRequestPending(true);
    pairSession({ cardId: inputValue, sessionId })
      .unwrap()
      .then((data) => {
        hideModal();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleCancel = () => {
    hideModal();
  };

  const handleOnChange = (value: any) => {
    setInputValue(value);
  };

  return (
    <>
      <IonButton
        // type="primary"
        fill="outline"
        color="secondary"
        // icon={<InboxOutlined />}
        onClick={showModal}
        className="shadow-lg shadow-teal-300/20"
      >
        <IonIcon slot="start" icon={download} />
        Receive
      </IonButton>
      <IonModal
        // title="Receive Phonon"
        isOpen={isModalVisible}
        // bodyStyle={{ textAlign: "center" }}
        // onOk={handleOk}
        // onCancel={handleCancel}
      >
        <div className="flex flex-col justify-between content-between p-12 h-full">
          <div>
            <p className="text-xs text-center text-gray-400">
              Share Code with Sender
            </p>
            <QRCode value={sessionId} size={256} />
          </div>

          <IonItem>
            <IonLabel position="stacked">Sender ID</IonLabel>
            <IonInput
              placeholder="0xASDASDASD"
              onIonChange={(e) => handleOnChange(e.detail.value!)}
              disabled={requestPending}
            />
          </IonItem>
          <div className="flex flex-row justify-evenly">
            <IonButton
              key="back"
              color="medium"
              fill="outline"
              onClick={handleCancel}
              disabled={requestPending}
            >
              Cancel
            </IonButton>
            <IonButton
              key="submit"
              fill="solid"
              color="primary"
              // type="primary"
              // loading={requestPending}
              onClick={handleOk}
            >
              Receive
            </IonButton>
          </div>
        </div>
      </IonModal>
    </>
  );
}