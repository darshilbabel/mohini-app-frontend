import { useTranslation } from "react-i18next";

const BASE_URL = process.env.REACT_APP_BASE_URL || "https://shikshagraha.org";

function Footer() {
  const { t } = useTranslation();

  return (
    <div>
      <style
        type="text/css"
        dangerouslySetInnerHTML={{
          __html:
            "\n         *{\n         -webkit-box-sizing: border-box;\n         -moz-box-sizing: border-box;\n         box-sizing: border-box;\n         }\n         html {\n         height: 100%;\n         }\n         body {\n         font-family: Montserrat, sans-serif;\n         margin: 0;\n         min-height: 100%;\n         background-color: #fff;\n         font-size: 14px;\n         line-height: 20px;\n         color: #333;\n         }\n         .footer h2 {\n         font-size: 32px;\n         line-height: 36px;\n         margin-top: 20px;\n         font-weight: bold;\n         margin-bottom: 10px;\n         }\n         .footer p {\n         margin-top: 0;\n         margin-bottom: 10px;\n         }\n         .footer {\n         background-color: #7f3289;\n         background-image: url('https://shikshagraha.org/images/Screenshot-2024-11-26-at-7.39.21-PM.png');\n         background-position: 30% 0;\n         background-repeat: no-repeat;\n         background-size: 110px;\n         justify-content: center;\n         align-items: center;\n         padding-top: 55px;\n         padding-bottom: 140px;\n         display: flex;\n         position: relative;\n         }\n         .footer .footer-image1 {\n         position: absolute;\n         inset: auto 0% 0%;\n         }\n         .footer .footer-image2 {\n         z-index: 0;\n         width: 30px;\n         position: absolute;\n         bottom: 50px;\n         right: 30%;\n         }\n         .footer .footer-image3 {\n         z-index: 0;\n         width: 80px;\n         position: absolute;\n         inset: auto 50% 160px auto;\n         }\n         .footer .small.da a {\n         color: white;\n         text-decoration: none;\n         }\n         .footer .frame {\n         justify-content: space-between;\n         align-items: center;\n          width: 90%;\n  max-width: 1670px;   display: flex;\n         position: relative;\n         }\n         .footer .frame.up {\n         align-items: flex-start;\n         margin-top: 20px;\n         margin-bottom: 20px;\n         position: relative;\n         }\n         .footer .frame.up.sx {\n         grid-column-gap: 60px;\n         grid-row-gap: 60px;\n         align-items: stretch;\n         }\n         .footer .fotter-f {\n         width: 25%;\n         }\n         .footer .fotter-f.swd {\n         width: 28%;\n         }\n         .footer .fotter-f.xas {\n         flex-flow: column;\n         justify-content: space-between;\n         display: flex;\n         }\n         .footer .fotter-f.xas.kk {\n         width: 20%;\n         }\n         .footer .image-25 {\n         margin-bottom: 27px;\n         }\n         .footer img {\n         max-width: 100%;\n         vertical-align: middle;\n         display: inline-block;\n         }\n         .footer .small {\n         color: #fff;\n         text-transform: none;\n         border-bottom: 4px solid #fff;\n         padding-bottom: 10px;\n         font-size: 19px;\n         font-weight: 300;\n         line-height: 24px;\n         }\n         .footer .small.da {\n         text-transform: capitalize;\n         border-bottom-style: none;\n         margin-top: 0;\n         margin-bottom: 0;\n         font-size: 18px;\n         line-height: 41px;\n         text-decoration: none;\n         }\n         .footer .fotter-f.xas.kk.asdf {\n         padding-top: 91px;\n         }\n         .footer .fotter-f.xas.kk.jn {\n         justify-content: flex-start;\n         align-items: center;\n         padding-top: 91px;\n         }\n         .footer .w-inline-block {\n         max-width: 100%;\n         display: inline-block;\n         }\n         .footer .image-14 {\n         width: 43px;\n         }\n         .footer .fotter-f.join {\n         background-color: #fa830b;\n         border-radius: 20px;\n         padding: 31px;\n         text-decoration: none;\n         }\n         .footer .small.da.dcd {\n         text-transform: none;\n         line-height: 29px;\n         }\n         .footer .div-block-85 {\n         grid-column-gap: 20px;\n         grid-row-gap: 20px;\n         justify-content: flex-start;\n         align-items: flex-start;\n         margin-top: 24px;\n         display: flex;\n         }\n         .footer .small.da.cdc {\n         text-transform: lowercase;\n         border-top: 1px solid #fff;\n         border-bottom-style: solid;\n         border-bottom-width: 1px;\n         margin-top: 16px;\n         padding-top: 25px;\n         padding-bottom: 25px;\n         font-size: 32px;\n         font-weight: 800;\n         }\n         @media screen and (max-width: 991px) {\n         .footer {\n         display: block;\n         padding: 60px 20px;\n         }\n         .footer .frame.up, .footer .frame.up.sx {\n         grid-column-gap: 30px;\n         grid-row-gap: 30px;\n         flex-flow: column;\n         width: 100%;\n         }\n         .footer .fotter-f.xas.kk.asdf, .footer .fotter-f.xas.kk.jn{\n         padding-top: 0px;\n         }\n         .footer .fotter-f.join{\twidth: 100%;\n         }\n         .footer .footer-image1{\t\n         max-width: 100%;\n         }\n         .footer .footer-image2, .footer .footer-image3{\n         display: none;\n         }\n         }\n         @media screen and (max-width: 767px) {\n         .footer .footer-image2 {\n         z-index: 0;\n         }\n         .footer .frame {\n         grid-column-gap: 10px;\n         grid-row-gap: 10px;\n         flex-flow: column;\n         justify-content: space-between;\n         align-items: flex-start;\n         }\n         .footer .frame.up {\n         grid-column-gap: 20px;\n         grid-row-gap: 20px;\n         flex-flow: column;\n         }\n         .footer .frame.up.sx {\n         grid-column-gap: 40px;\n         grid-row-gap: 40px;\n         }\n         .footer .fotter-f.swd {\n         width: 100%;\n         }\n         .footer .fotter-f.xas.kk {\n         width: 100%;\n         }\n         .footer .fotter-f.xas.kk.asdf {\n         width: 100%;\n         padding-top: 0;\n         }\n         .footer .fotter-f.xas.kk.jn {\n         justify-content: center;\n         align-items: flex-start;\n         width: 100%;\n  max-width: 1670px;       padding-top: 0;\n         }\n         }\n      ",
        }}
      />
      <section className="footer">
        <img
          src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Screenshot-2024-11-26-at-7.38.52-PM.png"
          loading="lazy"
          className="footer-image1"
          alt={t("footer.shikshalokamLogoAlt")}
        />
        <img
          src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Screenshot-2024-11-26-at-11.44.18-PM.png"
          loading="lazy"
          data-w-id="a7405d4d-2923-be0a-93fd-74913b70c592"
          alt=""
          className="footer-image2"
        />
        <img
          src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Screenshot-2024-11-26-at-11.45.14-PM.png"
          loading="lazy"
          data-w-id="8f4aa99c-5095-c687-30be-e260f0e43823"
          alt=""
          className="footer-image3"
        />
        <div className="frame up sx">
          <div className="fotter-f swd">
            <img
              src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-232-1.svg"
              loading="lazy"
              alt=""
              className="image-25"
            />
            <h2 className="small da">
              <a
                href={`${BASE_URL}/systemic-leadership-collective`}
                className="d"
              >
                {t("footer.systemicLeadershipCollective")} <br />
              </a>
              <a href={`${BASE_URL}/youth-leadership`} className="d">
                {t("footer.youthLeadershipCollective")} <br />
              </a>
              <a href={`${BASE_URL}/women`} className="d">
                {t("footer.womenLeadershipCollective")}
              </a>
            </h2>
          </div>
          <div className="fotter-f xas kk asdf">
            <h2 className="small da">
              <a
                href={`${BASE_URL}/about-us`}
                aria-current="page"
                className="d w--current"
              >
                {t("footer.aboutUs")} <br />
              </a>
              <a
                href={`${BASE_URL}/awards`}
                aria-current="page"
                className="d w--current"
              >
                {t("footer.shikshagrahaAwards")}
                <br />
              </a>
              <a
                href={process.env.REACT_APP_RECORD_STORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="d"
              >
                {t("footer.recordYourStory")}
              </a>
              <a href={`${BASE_URL}/knowledge-hub`} className="d">
                {t("footer.knowledgeHub")}
              </a>
            </h2>
          </div>
          <div className="fotter-f xas kk jn">
            <h2 className="small da">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfSX2bzdJzPBOlstfGg7vWqPFaS5weLnPpwIieR1DBdRgepPg/viewform"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("footer.joinTheMovement")}
              </a>
              <br />
            </h2>
            <div className="div-block-85">
              <a
                href="https://www.instagram.com/shikshagraha/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-inline-block"
              >
                <img
                  src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-16.svg"
                  loading="lazy"
                  alt=""
                  className="image-14"
                />
              </a>
              <a
                href="https://www.linkedin.com/company/shikshagraha/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-inline-block"
              >
                <img
                  src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-12.svg"
                  loading="lazy"
                  alt=""
                  className="image-14"
                />
              </a>
              <a
                href="https://www.facebook.com/shikshagraha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-inline-block"
              >
                <img
                  src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-14.svg"
                  loading="lazy"
                  alt=""
                  className="image-14"
                />
              </a>
              <a
                href="https://x.com/Shikshagraha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-inline-block"
              >
                <img
                  src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Image-39.png"
                  loading="lazy"
                  alt=""
                  className="image-14"
                />
              </a>
              <a
                href=" https://www.youtube.com/@shikshagraha"
                target="_blank"
                className="w-inline-block"
              >
                <img
                  src="https://shikshagraha.org/wp-content/uploads/2024/09/youtube-2.png"
                  loading="lazy"
                  alt=""
                  className="image-14"
                />
              </a>
            </div>
          </div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfSX2bzdJzPBOlstfGg7vWqPFaS5weLnPpwIieR1DBdRgepPg/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="fotter-f join w-inline-block"
          >
            <h2 className="small da dcd">
              {t("footer.joinShikshagrahaDescription")}
            </h2>
            <h2 className="small da cdc">{t("footer.joinUs")}</h2>
          </a>
        </div>
      </section>
    </div>
  );
}

export default Footer;
