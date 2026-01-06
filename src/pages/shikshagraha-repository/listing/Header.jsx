import React, { useEffect, useState } from "react"
import HeroSection from "./HeroSection"
import { clearMitraSessionStorage } from "../../ai-creation/pages/shikshalokam-mitra/MainPage"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import ROUTES from "../../../url"
import { FiArrowLeft } from "react-icons/fi"
import { HiMenu, HiX } from "react-icons/hi"

const BASE_URL = "https://shikshagraha.org"

export default function Header({ isHeroSection = true, isBackButton = false, onSidebarToggle, isSidebarOpen = false }) {
  const { t } = useTranslation("ai_creation_translation")
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <>
      <header className={`flex flex-col !p-3 md:!p-[25px] md:pb-8 w-full bg-white rounded-[16px] ${!isMobile ? "shadow-[0px_0px_4px_rgba(0,0,0,0.2)]" : ""} ${isMobile && isBackButton ? "items-start" : "items-end"}`}>
        {(isHeroSection || !isMobile) && <div className="w-full">
          <>
            <style
              type="text/css"
              dangerouslySetInnerHTML={{
                __html:
                  "\n         *{\n         -webkit-box-sizing: border-box;\n         -moz-box-sizing: border-box;\n         box-sizing: border-box;\n         }\n         html {\n         height: 100%;\n         }\n         body {\n         font-family: Montserrat, sans-serif;\n         margin: 0;\n         min-height: 100%;\n         background-color: #fff;\n         font-size: 14px;\n         line-height: 20px;\n         color: #333;\n         }\n\t\t \n\t\t @font-face {\n  font-family: 'webflow-icons';\n  src: url(\"data:application/x-font-ttf;charset=utf-8;base64,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\") format('truetype');\n  font-weight: normal;\n  font-style: normal;\n}\n\t\t \n\t\t .header-container {\n\t\t\t width: 100%;\n  max-width: 1670px;\n\t\t\t\n\t\t\tmargin-left: 0;\n\t\t\tmargin-right: 0;\n\t\t\tpadding-top: 19px;\n\t\t\tpadding-bottom: 19px;\n\t\t}\n\t\t\n\t\t.header-container .w-nav-brand {\n\t\t\tposition: relative;\n\t\t\tfloat: left;\n\t\t\ttext-decoration: none;\n\t\t\tcolor: #333333;\n\t\t}\n\t\t\n\t\t.header-container .brand {\n\t\t\tmargin-top: 11px;\n\t\t\tmargin-bottom: 11px;\n\t\t}\n\t\t\n\t\t.w-nav-menu {\n\t\t\tposition: relative;\n\t\t}\n\t\t\n\t\t.nav-menu {\n\t\t\tbackground-image: linear-gradient(#000000d9, #000000d9), url('https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Rectangle-402x-min-1-min.png');\n\t\t\tbackground-position: 0 0, 0 0;\n\t\t\tbackground-size: auto, cover;\n\t\t\theight: 100vh;\n\t\t\tpadding-top: 59px;\n\t\t}\n\t\t.w-nav[data-collapse='all'] .w-nav-menu {\n\t\t\tdisplay: none;\n\t\t}\n\t\t\n\t\t\n\t\t.w-nav-link {\n\t\t\tposition: relative;\n\t\t\tdisplay: inline-block;\n\t\t\tvertical-align: top;\n\t\t\ttext-decoration: none;\n\t\t\tcolor: #222222;\n\t\t\tpadding: 20px;\n\t\t\ttext-align: left;\n\t\t\tmargin-left: auto;\n\t\t\tmargin-right: auto;\n\t\t}\n\t\t\n\t\t.nav-link {\n\t\t\tcolor: #fff;\n\t\t\ttext-align: center;\n\t\t\ttext-transform: none;\n\t\t\tfont-size: 16px;\n\t\t}\n\t\t\n\t\t.w-dropdown {\n\t\t\tdisplay: inline-block;\n\t\t\tposition: relative;\n\t\t\ttext-align: left;\n\t\t\tmargin-left: auto;\n\t\t\tmargin-right: auto;\n\t\t\tz-index: 900;\n\t\t}\n\t\t\n\t\t.dropdown-2 {\n\t\t\tflex-flow: column;\n\t\t\tjustify-content: flex-start;\n\t\t\talign-items: center;\n\t\t\tdisplay: flex;\n\t\t}\n\t\t\n\t\t.w-dropdown {\n\t\t\tz-index: 0;\n\t\t\t  width: 100%;\n  max-width: 1670px;\n\t\t}\n\t\t\n\t\t.w-dropdown-btn, .w-dropdown-toggle, .w-dropdown-link {\n\t\t\tposition: relative;\n\t\t\tvertical-align: top;\n\t\t\ttext-decoration: none;\n\t\t\tcolor: #222222;\n\t\t\tpadding: 20px;\n\t\t\ttext-align: left;\n\t\t\tmargin-left: auto;\n\t\t\tmargin-right: auto;\n\t\t\twhite-space: nowrap;\n\t\t}\n\t\t\n\t\t.w-dropdown-toggle {\n\t\t\tuser-select: none;\n\t\t\tdisplay: inline-block;\n\t\t\tcursor: pointer;\n\t\t\tpadding-right: 40px;\n\t\t}\n\t\t\n\t\t.dropdown-toggle-2 {\n\t\t\tpadding-top: 0;\n\t\t\tpadding-bottom: 0;\n\t\t}\n\t\t\n\t\t[class^=\"w-icon-\"], [class*=\" w-icon-\"] {\n\t\t  font-family: 'webflow-icons' !important;\n\t\t  speak: none;\n\t\t  font-style: normal;\n\t\t  font-weight: normal;\n\t\t  font-variant: normal;\n\t\t  text-transform: none;\n\t\t  line-height: 1;\n\t\t  -webkit-font-smoothing: antialiased;\n\t\t  -moz-osx-font-smoothing: grayscale;\n\t\t}\n\t\t\n\t\t.w-icon-dropdown-toggle {\n\t\t\tposition: absolute;\n\t\t\ttop: 0;\n\t\t\tright: 0;\n\t\t\tbottom: 0;\n\t\t\tmargin: auto;\n\t\t\tmargin-right: 20px;\n\t\t\twidth: 1em;\n\t\t\theight: 1em;\n\t\t}\n\t\t\n\t\t.icon-2 {\n\t\t\tcolor: #fff;\n\t\t}\n\t\t\n\t\t.nav-link.sms {\n\t\t\ttext-transform: none;\n\t\t\tpadding-top: 3px;\n\t\t\tpadding-bottom: 3px;\n\t\t}\n\t\t\n\t\t.w-nav-button {\n\t\t\t  position: relative;\n\t\t\t  float: right;\n\t\t\t font-size: 24px;\n\t\t\t  display: none;\n\t\t\t  cursor: pointer;\n\t\t\t  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n\t\t\t  tap-highlight-color: rgba(0, 0, 0, 0);\n\t\t\t  user-select: none;\n\t\t\t}\n\t\t\t.w-nav-button:focus {\n\t\t\t  outline: 0;\n\t\t\t}\n\t\t\t.w-nav-button.w--open {\n\t\t\t  background-color: #C8C8C8;\n\t\t\t  color: white;\n\t\t\t}\n\t\t\t.w-nav[data-collapse='all'] .w-nav-menu {\n\t\t\t  display: none;\n\t\t\t}\n\t\t\t.w-nav[data-collapse='all'] .w-nav-button {\n\t\t\t  display: block;\n\t\t\t}\n         \n\t\t .w-icon-nav-menu:before {\n\t\tcontent: \"\\e602\";\n\t\t\n\t}\n\t\n\t.w-nav-overlay {\n\t\tposition: absolute;\n\t\toverflow: hidden;\n\t\tdisplay: none;\n\t\t\n\t\tleft: 0;\n\t\tright: 0;\n\t\twidth: 100%;\n\t}\n\t.w-nav-overlay.active .nav-menu{\n\t\tdisplay: block !important;\n\t}\n\t.header-container img {\n\t\tmax-width: 100%;\n\t\tvertical-align: middle;\n\t\tdisplay: inline-block;\n\t}\n\t.header-container .image-12 {\n\t\twidth: 175px;\n\t\theight: 40px;}\n\t\n\t.w-nav {\n\t\tposition: relative;\n\t\tbackground: #dddddd;\n\t\tz-index: 1000;\n\t}\n\t.navbar-2 {\n\t\tz-index: 1;\n\t\tbackground-color: #ddd0;\n\t\tjustify-content: center;\n\t\talign-items: center;\n\t\tdisplay: flex\t;\n\t}\n\t.w--nav-link-open {\n\t\tdisplay: block;\n\t\tposition: relative;\n\t}\n\t.w-dropdown-list {\n\t\tposition: absolute;\n\t\tbackground: #dddddd;\n\t\tdisplay: none;\n\t\tmin-width: 100%;\n\t}\n\t.dropdown-list-2 {\n\t\tposition: relative;\n\t}\n\t.w-dropdown-list.w--open {\n\t\tdisplay: block;\n\t\tbackground: transparent;\n\t}\n\t.w-icon-arrow-down:before, .w-icon-dropdown-toggle:before {\n\t\tcontent: \"\\e603\";\n\t}\n\t.section_full {\n\t\tjustify-content: center;\n\t\talign-items: center;\n\t\twidth: 100%;\n\t\tmargin-top: 40px;\n\t\tmargin-bottom: 40px;\n\t\tdisplay: flex;\n\t}\n\t.section_full.bhj {\n\t\tmargin-top: 0;\n\t}\n\t\t.frame {\n\t\tjustify-content: space-between;\n\t\talign-items: center;\n\t\twidth:100%; max-width: 1670;\n\t\tdisplay: flex;\n\t\tposition: relative;\n\t}\n\t.div-block-16 {\n\t\tbackground-color: #bebebe;\n\t\twidth: 100%;\n\t\theight: 1px;\n\t\tmargin-right: 20px;\n\t}\n\t.paragraph.asd.sc {\n\t\twidth: auto;\n\t}\n\t.paragraph {\n\t\tflex: none;\n\t\tmax-width: 340px;\n\t\tfont-size: 14px;\n\t\tfont-weight: 300;\n\t\tmargin: 0;\n\t}\n      ",
              }}
            />
            <div data-animation="default" data-collapse="all" data-duration={400} data-easing="ease" data-easing2="ease" data-doc-height={1} role="banner" className="navbar-2 w-nav" style={{ zIndex: 40 }}>
              <div className="header-container !py-0">
                <a href="https://shikshagraha.org/" className="brand w-nav-brand">
                  <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-22x.png" loading="lazy" alt="" className="image-12" />
                </a>

                {<div className="w-nav-button" onClick={() => setMenuOpen(prev => !prev)}>
                  <div style={menuOpen ? { backgroundColor: "#C8C8C8", color: "white" } : {}} className="w-icon-nav-menu flex items-center justify-center w-12 h-12" />
                </div>}
              </div>
            </div>
            <div className="section_full bhj break-words mb-0">
              <div className="frame hb">
                <div className="div-block-16 hidden md:block" />
                <p className="paragraph asd break-words w-full">A people’s movement towards education equity</p>
              </div>
            </div>
          </>
        </div>}
        {isBackButton && (
          <div className={`flex justify-between w-full ${isMobile && onSidebarToggle ? "gap-2" : ""}`}>
            <button
              className="bg-transparent w-fit p-0 border-0 cursor-pointer inline-flex items-center justify-center"
              onClick={() => {
                const currentRoute = window.location.pathname
                if (!currentRoute.includes(ROUTES.MITRA_CHAT)) {
                  clearMitraSessionStorage()
                  navigate(ROUTES.MITRA_CHAT)
                } else {
                  navigate(`/`)
                }
              }}
            >
              <FiArrowLeft className="w-8 h-8 text-[#1E1E1E]" />
            </button>
            {isMobile && onSidebarToggle && (
              <button onClick={onSidebarToggle} className="bg-transparent w-fit px-1" aria-label="Toggle sidebar">
                {isSidebarOpen ? <HiX className="w-6 h-6 text-[#555555]" /> : <HiMenu className="w-6 h-6 text-[#555555]" />}
              </button>
            )}
          </div>
        )}
        {/* {isHeroSection && (
          <div className="mt-[-1rem] flex justify-start w-full">
            <HeroSection />
          </div>
        )}{" "} */}
      </header>
      {isHeroSection && (
        <div className="mt-[-1rem] flex justify-start w-full">
          <HeroSection />
        </div>
      )}{" "}
      {menuOpen && (
        <div className="w-screen h-[100dvh]  absolute z-[999] top-0" onClick={() => setMenuOpen(false)}>
          <div className="w-nav-overlay active w-full h-[calc(100vh-9rem)] top-[9rem]" data-wf-ignore="" id="w-nav-overlay-0" style={menuOpen ? { display: "block" } : { height: "0px", display: "none" }}>
            <nav role="navigation" className={" " + (menuOpen ? "nav-menu w-nav-menu" : "nav-menu w-nav-menu")} onClick={e => e.stopPropagation()}>
              <div className="grid">
                <a href="https://shikshagraha.org/" className="nav-link w-nav-link">
                  Home
                </a>
                <a href={`${BASE_URL}/about-us`} className="nav-link w-nav-link">
                  About Us
                </a>
                <div
                  data-hover="false"
                  data-delay={0}
                  className="dropdown-2 w-dropdown"
                  onClick={e => {
                    e.stopPropagation()
                    setDropdownOpen(!dropdownOpen)
                  }}
                >
                  <div className="dropdown-toggle-2 w-dropdown-toggle">
                    <div className="icon-2 w-icon-dropdown-toggle" />
                    <div className="nav-link dcd asafa w-nav-link">Initiatives</div>
                  </div>
                  {dropdownOpen && (
                    <nav className="dropdown-list-2 grid" onClick={e => e.stopPropagation()}>
                      <a href={`${BASE_URL}/systemic-leadership-collective`} className="nav-link sms w-nav-link">
                        Systemic Leadership Collective
                      </a>
                      <a href={`${BASE_URL}/youth-leadership/`} className="nav-link sms w-nav-link">
                        Youth Leadership Collective
                      </a>
                      <a href={`${BASE_URL}/women`} className="nav-link sms w-nav-link">
                        Women Leadership Collective
                      </a>
                    </nav>
                  )}
                </div>
                <a href={`${BASE_URL}/awards`} className="nav-link w-nav-link">
                  Shikshagraha Awards
                </a>
                <a href={`${BASE_URL}/knowledge-hub`} className="nav-link w-nav-link">
                  Knowledge Hub
                </a>
                <a href={`${BASE_URL}/story-archive`} className="nav-link w-nav-link">
                  Stories of Impact
                </a>
                <a rel="noopener noreferrer" href="https://docs.google.com/forms/d/e/1FAIpQLSfSX2bzdJzPBOlstfGg7vWqPFaS5weLnPpwIieR1DBdRgepPg/viewform" target="_blank" className="nav-link w-nav-link">
                  Join the Movement
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
