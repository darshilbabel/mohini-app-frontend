import { useTranslation } from "react-i18next"
import Swal from "sweetalert2"

export const useConfirmationPopup = () => {
  const { t } = useTranslation()

  const showGuestPopup = async (yesButtonAction, noButtonAction) => {
    const result = await Swal.fire({
      title: t("guestPopUpChanges"),
      showCancelButton: true,
      confirmButtonText: t("confirmChanges"),
      cancelButtonText: t("denyButton"),
    })

    if (result.isConfirmed) {
      if (yesButtonAction) yesButtonAction()
    } else {
      if (noButtonAction) noButtonAction()
    }
  }

  const showConfirmationPopup = async noButtonAction => {
    const result = await Swal.fire({
      title: t("popUpChanges"),
      showCancelButton: true,
      confirmButtonText: t("confirmChanges"),
      cancelButtonText: t("denyButton"),
    })

    if (result.isConfirmed) {
      window.location.reload()
    } else {
      if (noButtonAction) noButtonAction()
    }
  }

  return {
    showGuestPopup,
    showConfirmationPopup,
  }
}
