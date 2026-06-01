import { useLocation } from "react-router-dom";
import { useToast } from "../../components/ui/ToastContext";

export const PREVIEW_BASE_PATH = "/preview";

export const isPreviewPath = (pathname = window.location.pathname) =>
  pathname === PREVIEW_BASE_PATH || pathname.startsWith(`${PREVIEW_BASE_PATH}/`);

export const withPreviewPath = (path: string) =>
  `${PREVIEW_BASE_PATH}${path === "/" ? "" : path}`;

export const useIsPreviewMode = () => {
  const location = useLocation();
  return isPreviewPath(location.pathname);
};

export const usePreviewGuard = () => {
  const isPreviewMode = useIsPreviewMode();
  const { notify } = useToast();

  const guardPreviewAction = (message = "Mode demo hanya menampilkan data contoh. Masuk untuk menjalankan aksi ini.") => {
    if (isPreviewMode) {
      notify(message, "info");
      return true;
    }
    return false;
  };

  return { isPreviewMode, guardPreviewAction };
};
