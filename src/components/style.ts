import { css } from "@emotion/css";

export const MapContainesStyles = () => {
    return {
      wrapper: css`
        font-family: Open Sans;
      `,
      styledTooltip: css`
        background: none !important;
        border: none !important;
        box-shadow: none !important;
        text-align: center;
      `,
      tooltipTitle: css`
        font-weight: 800;
        font-size: 18px;
        text-shadow: 2px 1px 2px white;
        color: #000D49;
        margin-bottom: 0 !important; 
      `,
      styledButton: css`
        background-color: white;
        color: black;
        font-size: 14px;
        border-radius: 4px;
        border: 2px solid rgba(0, 0, 0, 0.2);
        background-clip: padding-box;
        cursor: pointer !important;
      `,
      styledImg: css`
        width: 20px;
        margin: 5px;
      `,
      title: css`
        font-size: 16px;
        margin-bottom: 5px !important;
      `,
      headerText: css`
        font-weight: bolder !important;
        display: inline !important;
      `,
      text: css`
        margin: 0 !important;
        font-size: 14px;
      `,
      styledPopup: css`
        background: transparent !important;
        background-color: none;
      `,
    };
  };

  export const PolygonCreatorStyles = () => {
    return {
        styledTooltip: css`
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          text-align: center;
        `,
        tooltipTitle: css`
        font-weight: 800;
        font-size: 18px;
        text-shadow: 2px 1px 2px white;
        color: #000D49;
        margin-bottom: 0 !important; 
      `,
      title: css`
        font-size: 16px;
        margin-bottom: 5px !important;
      `,
    }
};

export const PolygonEditorStyles = () => {
  return {
    tooltipWrapper: css`
      margin-bottom: 25px;
    `,
  };
};
