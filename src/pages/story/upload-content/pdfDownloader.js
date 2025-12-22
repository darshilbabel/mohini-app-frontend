import React, { useEffect, useMemo, useState } from "react"
import { createStoryMediaApi, getStoryAllMedia, updateStoryMediaApi, getProfileUserApi } from "api/endpoints"
import html2pdf from "html2pdf.js"
import StorySecondPage from "./StorySecondPage"
import StoryThirdPage from "./StoryThirdPage"
import StoryFirstPage from "./StoryFirstPage"
import StoryFifthPage from "./StoryFifthPage"
import Cookies from "universal-cookie"
import getConfiguration from "../../../configure"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useUserDataLocalStore } from "store"

const PdfDownloader = ({ storyData, isShikshalokam, downloadTriggered, handleDownloadStop, storyMediaArr, currentState, current_company }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [contentPDF, setContentPDF] = useState({
    content1: "",
    content2: "",
    tweetContent: "",
    companyLogo: "",
  })
  const [userData, setUserData] = useState({
    authorName: "",
    organization: "",
    address: "",
  })
  const [files, setFiles] = useState([])
  const [pages, setPages] = useState([])
  const [storyMediaIdArray, setStoryMediaIdArray] = useState(null)
  const downloadTriggeredRef = React.useRef(false)

  const pdfRef = React.useRef()
  const imagesPerPage = 2

  const cookie = new Cookies()
  const accessToken = useMemo(() => {
    const token = cookie.get("accessToken")
    return token !== undefined && token !== null ? token : null
  }, [])

  useEffect(() => {
    if (!storyData || !storyMediaIdArray) return

    if (storyData && storyData?.formatted_content) {
      wordCounter(storyData)
      tweetCounter(storyData)
    }
    return () => {}
  }, [storyData, storyMediaIdArray])

  useEffect(() => {
    if (!storyMediaArr) return
    try {
      setStoryMediaIdArray(storyMediaArr)
    } catch (error) {}
  }, [storyMediaArr])

  useEffect(() => {
    if (!storyMediaIdArray || !imagesPerPage) return
    setPages([])
    let images
    storyMediaIdArray ? (images = storyMediaIdArray.map(y => y?.base64_str)) : (images = [])
    let remainingImages = images
    while (remainingImages?.length > 0) {
      const currentPageImages = remainingImages?.slice(0, imagesPerPage)
      setPages(prevPages => [...prevPages, currentPageImages])
      remainingImages = remainingImages?.slice(imagesPerPage)
    }
  }, [storyMediaIdArray, imagesPerPage])

  useEffect(() => {
    if (downloadTriggered && contentPDF && currentState && current_company && !downloadTriggeredRef.current) {
      downloadTriggeredRef.current = true
      pdfDownload()
    }
  }, [downloadTriggered, contentPDF, currentState, current_company])

  useEffect(() => {
    if (!accessToken) return

    let profID = cookie.get("profileid")

    getProfileUserApi(profID, accessToken)
      .then(response => {
        if (response) {
          setUserData(prev => ({
            ...prev,
            authorName: response?.first_name,
            organization: response?.org_associated,
            address: !!response?.profile_address[0] ? response?.profile_address[0]?.district : "",
          }))
        }
      })
      .catch(error => {
        console.error("Error fetching profile user:", error)
      })
  }, [accessToken])

  useEffect(() => {
    if (current_company) {
      switchPdfPage()
    }
    return () => {}
  }, [current_company])

  async function autoExpandOnce() {
    let textbox = [...document.querySelectorAll(".textBox-autoresizing")]
    let totalHeight = 0
    textbox.map(subBox => {
      return (subBox.style.height = "auto"), (totalHeight = subBox.scrollHeight), (totalHeight += 20), (subBox.style.height = totalHeight <= parseInt(window.getComputedStyle(subBox).maxHeight) ? totalHeight + "px" : window.getComputedStyle(subBox).maxHeight)
    })
  }

  function switchPdfPage() {
    const current_company_config = getConfiguration()
    const { company_name, collab_logo } = current_company_config
    setContentPDF(oldContent => ({
      ...oldContent,
      companyLogo: "/images/shikshalokam_logo_pdf.png",
    }))
  }

  function wordCounter(storyText) {
    storyText = JSON.parse(storyData?.formatted_content)?.filter(x => x.type === "paragraph")

    if (storyText?.length > 0 && storyText[0]?.data?.text === storyData.title) {
      storyText = storyText.slice(1)
    }

    let content1 = [""]
    let content2 = ""
    let images = storyMediaIdArray ? storyMediaIdArray.map(y => y?.file) : []

    if (images.length % 2 === 0) {
      let wordFormed = ""
      let wordCount = 0
      let j = 0

      storyText.forEach(subData => {
        let text = subData.data.text
        let lines = text.split("\n")

        lines.forEach(line => {
          for (let k = 0; k < line.length; ) {
            if (wordCount < 300) {
              wordFormed += line[k++]
              if (line[k] === " ") wordCount++
              if (line[k] === undefined) wordCount++
            } else {
              content1[j] = wordFormed
              wordFormed = ""
              wordCount = 0
              j++
            }
          }
          wordFormed += "<br />"
          wordCount++
        })
      })

      if (wordCount !== 0) {
        content1[j] = wordFormed
      }
    } else {
      let wordFormed = ""
      let wordCount = 0
      let wordCount1 = 0
      let isContent2FullyFilled = false
      let j = 0

      storyText.forEach(subData => {
        let text = subData.data.text
        let lines = text.split("\n")

        lines.forEach(line => {
          for (let k = 0; k < line.length; ) {
            if (wordCount1 < 100 && !isContent2FullyFilled) {
              content2 += line[k++]
              if (line[k] === " ") wordCount1++
              if (line[k] === undefined) wordCount1++
            } else if (wordCount < 300) {
              isContent2FullyFilled = true
              wordFormed += line[k++]
              if (line[k] === " ") wordCount++
              if (line[k] === undefined) wordCount++
              if (k === line.length) {
                wordFormed += "<br />"
                wordCount++
              }
            } else {
              content1[j] = wordFormed
              wordFormed = ""
              wordCount = 0
              j++
            }
          }
          if (wordCount1 < 100) {
            content2 += "<br />"
            wordCount1++
          }
        })
      })

      if (wordCount !== 0) {
        content1[j] = wordFormed
      }
    }

    setContentPDF(oldContent => ({
      ...oldContent,
      content1: content1,
      content2: content2,
    }))
  }

  function tweetCounter(storyText) {
    const tweetWordLimit = 280
    storyText = storyData?.tweet
    let counter = 0
    let subCounter = 0
    let content1 = ""

    for (let j = 0; j < storyText?.length; j++) {
      if (storyText[j] === " ") {
        counter += 1
      }
    }
    counter += 1
    if (counter > tweetWordLimit) counter = tweetWordLimit

    for (let j = 0; j < storyText?.length; j++) {
      if (subCounter < counter) {
        if (storyText[j] === " ") {
          subCounter += 1
        }
        content1 += storyText[j]
      } else {
        break
      }
    }

    setContentPDF(oldContent => ({
      ...oldContent,
      tweetContent: content1,
    }))
  }

  async function uploadFile(formData, fileData, fileName, mediaId, storyId) {
    const story_media = storyData?.story_media.filter(item => item?.media_type === "application/pdf")
    const { getAccessToken } = useUserDataLocalStore.getState()
    const access_token = getAccessToken()

    if (story_media.length === 0) {
      setIsLoading(true)
      const story_media = await createStoryMediaApi({
        data: formData,
        token: access_token,
      })
      const story_all_response = await getStoryAllMedia({
        data: {
          story: storyData?.id,
        },
        token: access_token,
      })

      setFiles(story_all_response?.results || [])
      setIsLoading(false)
    } else {
      setIsLoading(true)
      await updateStoryMediaApi({
        data: {
          story: storyData?.id,
          name: fileName,
          file: fileData,
          id: mediaId,
          media_type: "application/pdf",
          access_token: access_token,
          session: JSON.parse(localStorage.getItem("sessionid")),
        },
        token: access_token,
      })
      setIsLoading(false)
    }
  }

  async function convertImagesToPDF(imageDataURLs) {
    return new Promise((resolve, reject) => {
      try {
        const pdf = new jsPDF()
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        imageDataURLs.forEach((imageDataURL, index) => {
          if (index !== 0) {
            pdf.addPage()
          }
          pdf.addImage(imageDataURL, "PNG", 0, 0, pdfWidth, pdfHeight, "", "FAST")
        })

        const blob = pdf.output("blob")
        resolve(blob)
      } catch (error) {
        reject(error)
      }
    })
  }

  async function captureAndConvertToJPG() {
    await autoExpandOnce()
    return new Promise((resolve, reject) => {
      const container = document.getElementsByClassName("no-page-break")

      if (container.length === 0) {
        reject(new Error('No elements found with class "no-page-break"'))
        return
      }

      const seenElements = new Set()
      const uniqueElements = []

      for (let i = 0; i < container.length; i++) {
        const element = container[i]
        const uniqueKey = element.outerHTML

        if (!seenElements.has(uniqueKey)) {
          seenElements.add(uniqueKey)
          uniqueElements.push(element)
        }
      }

      const captureAndConvertContainer = async element => {
        try {
          const canvas = await html2canvas(element)
          const imgData = canvas.toDataURL("image/png")
          return imgData
        } catch (error) {
          throw error
        }
      }

      const promises = uniqueElements.map(element => captureAndConvertContainer(element))

      Promise.all(promises)
        .then(imageDataArray => {
          resolve(imageDataArray)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  async function pdfDownload() {
    setIsLoading(true)
    const input = pdfRef.current
    input.style.display = "static"
    input.style.position = "relative"
    input.style.left = 0
    input.style.top = 0
    document.getElementById("mainDivStory").style.position = "fixed"
    document.getElementById("mainDivStory").style.overflowY = "scroll"
    var opt = {
      margin: 0,
      filename: `${storyData?.title}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      enableLinks: true,
      html2canvas: { scale: 1, scrollY: 1, allowTaint: false, useCORS: true },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        width: 210,
        height: 297,
      },
    }
    await new Promise(resolve => setTimeout(resolve, 5000))
    const pdfFilePromise = html2pdf().from(input).set(opt).outputPdf()
    pdfFilePromise?.save()

    pdfFilePromise
      .then(() => {
        input.style.position = "absolute"
        input.style.left = "-9999px"
        input.style.top = "-9999px"
        document.getElementById("mainDivStory").style.position = "static"
        document.getElementById("mainDivStory").style.overflowY = "auto"
      })
      .catch(error => {
        console.error("Error generating PDF:", error)
      })
    let imageURL = await captureAndConvertToJPG()
    const pdfBlob = await convertImagesToPDF(imageURL)
    const file = new File([pdfBlob], `${storyData?.title}.pdf`, {
      type: "application/pdf",
    })
    const formData = new FormData()
    const story_media = storyData?.story_media.filter(item => item?.media_type === "application/pdf")

    formData.append("file", file)
    formData.append("story", storyData?.id)
    formData.append("name", `${storyData?.title}.pdf`)
    formData.append("media_type", "application/pdf")
    formData.append("access_token", localStorage.getItem("accessToken"))
    formData.append("session", JSON.parse(localStorage.getItem("sessionid")))

    uploadFile(formData, file, `${storyData?.title}.pdf`, story_media[0]?.id, storyData?.id)
      .then(() => {
        setIsLoading(false)
        downloadTriggeredRef.current = false
        handleDownloadStop()
      })
      .catch(error => {
        console.error("Error uploading file:", error)
      })
  }

  function addPages() {
    if (!storyMediaIdArray || !storyData || !storyData?.formatted_content || (contentPDF?.content1 === "" && contentPDF?.content2 === "") || !current_company || !currentState) return

    let images = []
    storyMediaIdArray ? (images = storyMediaIdArray.map(y => y?.base64_str)) : (images = [])
    if (images.length !== 0 && images.length % 2 === 0) {
      return (
        <>
          {pages.map((page, pageIndex) => (
            <StorySecondPage key={pageIndex} images={page} fontSize="1.1rem" imgPerPage={imagesPerPage} title={storyData?.title} />
          ))}
          {currentState === "Nagaland" && <StoryFifthPage {...storyData} />}
          {contentPDF.content2 === "" && showThirdPage(false)}
          {currentState !== "Nagaland" && <StoryFifthPage {...storyData} />}
        </>
      )
    } else if (images.length !== 0 && images.length % 2 !== 0) {
      return (
        <>
          {currentState === "Nagaland" && <StoryFifthPage {...storyData} />}
          {contentPDF.content1[0] === "" && pages.map((page, pageIndex) => <StorySecondPage key={pageIndex} content1={contentPDF.content2} images={page} fontSize="1.1rem" tweet={contentPDF.tweetContent} imgPerPage={imagesPerPage} title={storyData?.title} />)}

          {contentPDF.content1[0] !== "" && pages.map((page, pageIndex) => <StorySecondPage key={pageIndex} content1={contentPDF.content2} images={page} fontSize="1.1rem" imgPerPage={imagesPerPage} title={storyData?.title} />)}
          {contentPDF.content1[0] !== "" && showThirdPage(false)}
          {currentState !== "Nagaland" && <StoryFifthPage {...storyData} />}
        </>
      )
    } else if (images.length === 0) {
      return (
        <>
          {currentState === "Nagaland" && <StoryFifthPage {...storyData} />}
          {contentPDF.content2 === "" && showThirdPage(true)}
          {currentState !== "Nagaland" && <StoryFifthPage {...storyData} />}
        </>
      )
    }
  }

  function showThirdPage(isHeadingVisible) {
    if (contentPDF.content1.length === 0 || !storyData) return

    return contentPDF.content1.map((item, index) => {
      if (item === "") return
      if (isHeadingVisible === true && index !== 0) isHeadingVisible = false
      if (index === contentPDF.content1.length - 1) {
        return <StoryThirdPage key={`${item}_${index}`} content2={item} fontSize="1.1rem" tweet={contentPDF.tweetContent} shouldShowStoryHeading={isHeadingVisible} title={storyData?.title} />
      } else {
        return <StoryThirdPage key={`${item}_${index}`} content2={item} fontSize="1.1rem" shouldShowStoryHeading={isHeadingVisible} title={storyData?.title} />
      }
    })
  }

  useEffect(() => {}, [contentPDF])

  function showPdfAccToCompany() {
    if (!current_company || !currentState || !storyData || !userData || !contentPDF) return

    let hasName = false
    let hasOrg = false
    let hasAddress = false

    if (userData?.authorName !== null && userData?.authorName !== "undefined" && userData?.authorName !== "") {
      hasName = true
    }
    if (userData?.organization !== null && userData?.organization !== "undefined" && userData?.organization !== "") {
      hasOrg = true
    }
    if (userData?.address !== null && userData?.address !== "undefined" && userData?.address !== "") {
      hasAddress = true
    }

    let authorDetail = "Author : "

    if (hasName) {
      authorDetail += userData?.authorName
      if (hasOrg) {
        authorDetail += ", " + userData?.organization
      }
      if (hasAddress) {
        authorDetail += ", " + userData?.address
      }
    } else if (hasOrg) {
      authorDetail += userData?.organization
      if (hasAddress) {
        authorDetail += ", " + userData?.address
      }
    } else if (hasAddress) {
      authorDetail += ", " + userData?.address
    } else {
      authorDetail = ""
    }

    return (
      <>
        {storyData && userData && <StoryFirstPage title={storyData?.title} author={authorDetail} companyLogo={contentPDF?.companyLogo} schoolName={userData?.organization} currentState={currentState} />}

        {addPages()}
      </>
    )
  }

  return (
    <div className="container mx-auto" id="mainDivStory">
      <div ref={pdfRef} style={{}}>
        {showPdfAccToCompany()}
      </div>
    </div>
  )
}

export default PdfDownloader
