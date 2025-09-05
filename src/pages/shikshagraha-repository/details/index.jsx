// ResourceDetailPage.jsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Download, Heart, Share2, Star } from "lucide-react";
import ReviewForm from "./ReviewForm";
import { useNavigate, useParams } from "react-router-dom";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import { toast, ToastContainer } from "react-toastify";

export default function ResourceDetailPage() {
  const params = useParams();

  const resourceData = useRepositoryStore((state) => state.selectedMedia);
  const fetchMediaDetail = useRepositoryStore(
    (state) => state.fetchMediaDetail
  );
  const isLoading = useRepositoryStore((state) => state.loadingDetail);
  useEffect(() => {
    fetchMediaDetail(params.id);
  }, [fetchMediaDetail, params.id]);
  console.log({ resourceData });
  const [tab, setTab] = useState("Overview");

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 relative">
      <ToastContainer/>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-white h-screen">
          Please wait we are loading your data
        </div>
      )}
      <BackButton />
      <div className="flex gap-8 mt-2">
        {/* <ResourceImages images={resourceData?.images} /> */}
        <ResourceMeta resource={resourceData} />
      </div>
      <Tabs tab={tab} setTab={setTab} />
      <TabContent tab={tab} resource={resourceData} />
    </div>
  );
}

// --- Components below --- //

function BackButton() {
  const navigate = useNavigate();
  // Optionally handle navigation
  return (
    <button className="mb-4" onClick={() => navigate(-1)}>
      <ArrowLeft size={28} />
    </button>
  );
}

export function ResourceImages({ images }) {
  return (
    <div className="flex flex-col items-center min-w-[260px] max-w-[320px]">
      <img
        src={images?.[0]}
        alt="Primary"
        className="mb-2 rounded-lg aspect-[5/4] object-cover w-full"
      />
      <div className="flex gap-2 w-full">
        {(images ?? []).slice(1, 5).map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`thumb-${i}`}
            className="rounded-md w-20 aspect-video object-cover"
          />
        ))}
      </div>
    </div>
  );
}

function ResourceMeta({ resource }) {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{resource?.title}</h1>
      {/* <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              fill={i < Math.floor(resource?.rating) ? "#FFD700" : "none"}
              stroke="#FFD700"
              size={20}
            />
          ))}
          <span className="font-medium">{resource?.rating}</span>
          <span className="text-gray-500 text-sm">
            ({resource?.reviews} Reviews)
          </span>
        </div>
        <div className="flex items-center mt-1 gap-3 text-gray-600 text-sm">
          <Download
            size={16}
            className="font-bold text-gray-700 stroke-2 stroke-slate-700 "
          />{" "}
          {resource?.downloads} Downloads
        </div>
      </div> */}
      <p className="text-gray-700 mt-2">{resource?.shortDescription}</p>
      <div className="flex gap-8 mt-2 items-center text-gray-600 text-sm">
        <div>
          <span>File type</span>
          <div className="font-bold mt-1">{resource?.media_type_display}</div>
        </div>
        <div>
          <span>File Size</span>
          <div className="font-bold mt-1">{resource?.size || "N/A"}</div>
        </div>
        <div>
          <span>Last Updated</span>
          <div className="font-bold mt-1">
            {new Date(resource?.updated_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
      <Actions downloadUrl={resource?.s3_url} />
    </div>
  );
}

function Actions({ downloadUrl }) {
  return (
    <div className="flex gap-2 mt-4">
      <button className="bg-blue-600 text-white px-6 py-2 rounded shadow font-medium" onClick={() => window.open(downloadUrl, "_blank")}>
        Download Resource
      </button>
      {/* <button className="border p-2 rounded">
        <Heart />
      </button> */}
      <button className="border p-2 rounded" onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        toast("Link copied to clipboard");
      }}>
        <Share2 />
      </button>
    </div>
  );
}

const TABS_LIST = ["Overview"];//"Review", "Related"

function Tabs({ tab, setTab }) {
  return (
    <div className="flex gap-8 border-b pt-8 mb-2 sticky top-0 bg-white">
      {TABS_LIST.map((name) => (
        <button
          key={name}
          className={`px-2 py-2 outline-none border-b-2 transition ${
            tab === name
              ? "border-blue-600 text-blue-600 font-medium"
              : "border-transparent text-gray-600"
          }`}
          onClick={() => setTab(name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function TabContent({ tab, resource }) {
  if (tab === "Overview")
    return <OverviewContent overview={resource?.key_values} />;
  if (tab === "Review")
    return <ReviewsSection reviews={resource?.reviewsList} />;
  if (tab === "Related")
    return <RelatedResources related={resource?.related} />;
  return null;
}

// --- Sample Overview/Review/Related components --- //

function OverviewContent({ overview }) {
  return (
    <div className="py-4 prose prose-p:text-gray-600 prose-p:text-sm prose-p:font-normal prose-p:leading-relaxed prose-p:mt-2 prose-p:mb-2 prose-p:font-sans prose-h1:text-blue-600 prose-h2:text-blue-600 prose-h3:text-blue-600 prose-h4:text-blue-600 prose-h5:text-blue-600 prose-h6:text-blue-600 prose-ul:list-disc prose-ul:ml-6 prose-ul:mt-2 prose-ul:mb-2 prose-ul:font-normal prose-ul:font-sans prose-ul:text-gray-600 prose-ul:text-sm prose-ul:leading-relaxed prose-ul:pl-6">
      {/* Paste overview markdown/html as needed */}
      {overview?.map(({ key, value }, index) => (
        <div key={index}>
          <h2 className="py-1 capitalize">{String(key).toLowerCase()}</h2>
          <div dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      ))}
    </div>
  );
}
function ReviewsSection({ reviews }) {
  return (
    <div className="py-8">
      <h2 className="text-[1.5rem] font-semibold text-blue-700 mb-6">
        User Feedback
      </h2>
      <div className="flex flex-col gap-6">
        {reviews?.map((review, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">{review.name}</span>
                <span className="block text-gray-500 text-sm">
                  {review.org}
                </span>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    fill={j < review.rating ? "#FFD700" : "none"}
                    stroke="#FFD700"
                    size={22}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3">{review.comment}</div>
          </div>
        ))}
      </div>
      <ReviewForm onSubmit={(review) => console.log(review)} />
    </div>
  );
}

function RelatedResources({ related }) {
  return (
    <div className="py-8">
      {/* Implement related resources list */}
      <span>Related resources go here.</span>
    </div>
  );
}
