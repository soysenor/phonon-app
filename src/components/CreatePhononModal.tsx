import { IonButton, IonModal, useIonRouter } from "@ionic/react";
import { ethers } from "ethers";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { CreatePhononFormSingleValues } from "../components/CreatePhononFormSingle";
import useChain from "../hooks/useChain";
import {
  useFinalizeDepositMutation,
  useInitDepositMutation,
} from "../store/api";
import { ethToBn, ethToWei, weiToEth } from "../utils/denomination";
import { isValidPhononDenomination } from "../utils/validation";

export default function CreatePhononModal({
  isModalVisible,
  hideModal,
}: {
  isModalVisible: boolean;
  hideModal: () => void;
}) {
  const { sessionId } = useParams<{
    sessionId: string;
  }>();
  const router = useIonRouter();
  const [isPending, setIsPending] = useState(false);
  const [initDeposit] = useInitDepositMutation();
  const [finalizeDeposit] = useFinalizeDepositMutation();
  const { chain, chainId } = useChain();

  const onSubmitSingle = (data: CreatePhononFormSingleValues) =>
    onSubmit([{ amount: 1, denomination: data.amount }]);

  const onSubmit = async (
    data: {
      amount: number;
      denomination: string;
    }[]
  ) => {
    setIsPending(true);
    const Denominations = data.flatMap((d) => {
      const denomination = ethToWei(d.denomination);
      const arr = Array(d.amount);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return arr.fill(denomination);
    });
    const CurrencyType = chain.CurrencyType;
    const payload = { CurrencyType, Denominations };
    await initDeposit({ payload, sessionId })
      .unwrap()
      .then(async (payload) => {
        // @ts-expect-error - window
        if (window.ethereum) {
          // @ts-expect-error - window
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const ChainID = chainId;
          const signer = provider.getSigner();
          await Promise.all(
            payload.map(async (phonon) => {
              const to = phonon.Address;
              const value = ethToBn(weiToEth(phonon.Denomination));

              return signer
                .sendTransaction({ to, value })
                .then(async (response) => {
                  if (response) {
                    const Phonon = { ...phonon, ChainID };
                    const payload = [
                      {
                        Phonon,
                        ConfirmedOnChain: true,
                        ConfirmedOnCard: true,
                      },
                    ];
                    await finalizeDeposit({ payload, sessionId }).catch(
                      console.error
                    );
                    hideModal();
                  }
                })
                .catch(console.error)
                .finally(() => setIsPending(false));
            })
          );
        } else {
          // TODO: Show an error message to the user about MetaMask not being installed or available
          throw new Error("MetaMask is not installed.");
          setIsPending(false);
        }
      });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePhononFormSingleValues>();

  return (
    <IonModal isOpen={isModalVisible} onDidDismiss={hideModal}>
      <div className="flex flex-col content-center justify-start gap-2">
        <p className="text-xl font-bold text-center text-gray-300 uppercase">
          Create {chain.ticker}
        </p>
        <form
          className="flex flex-col content-center justify-start h-full gap-2 p-2"
          onSubmit={handleSubmit(onSubmitSingle)}
        >
          <input
            className="text-bold p-2 text-xl bg-zinc-800 shadow-inner"
            placeholder="Amount"
            disabled={isPending}
            {...register("amount", {
              required: true,
              validate: isValidPhononDenomination,
            })}
          />
          {errors?.amount?.type === "required" && (
            <p className="text-bold p-2 text-xl text-zinc-200 shadow-inner">
              Amount is required.
            </p>
          )}
          {errors?.amount?.type === "validate" && (
            <p className="text-bold p-2 text-xl text-zinc-200 shadow-inner">
              First three digits must be less than 255.
            </p>
          )}

          <div className="pinned">
            <IonButton
              key="submit"
              size="large"
              type="submit"
              fill="solid"
              expand="full"
              color="primary"
              className="shadow-lg shadow-teal-300/40"
              disabled={isPending}
            >
              Create
            </IonButton>
          </div>
        </form>
      </div>
    </IonModal>
  );
}