import { IonButton, IonIcon, useIonRouter } from "@ionic/react";
import { logOutOutline } from "ionicons/icons";
import React from "react";
import { useParams } from "react-router";

export default function RedeemPhononButton() {
  const { sessionId, networkId } = useParams<{
    sessionId: string;
    networkId: string;
  }>();
  const router = useIonRouter();

  const goToRedeemPage = () => {
    router.push(`/${sessionId}/${networkId}/redeem`);
  };

  return (
    <>
      <IonButton
        fill="outline"
        color="tertiary"
        slot="secondary"
        onClick={goToRedeemPage}
        className="shadow-lg shadow-blue-300/20"
      >
        <IonIcon slot="end" icon={logOutOutline} />
        Redeem
      </IonButton>
    </>
  );
}
