//apollo stuff
import { useQuery } from "@apollo/client";
import { ARTIST_DETAILS_QUERY } from "../../Apollo/queries";

//sub-components
import AddToFavorites from "../Common/AddToFavorites";
import Alert from "../Common/Alert";
import Heading from "../Common/Heading";
import ListOfReleases from "./ListOfReleases";
import Loader from "../Common/Loader";
import RatingDisk from "../Common/RatingDisk";
import ReactCountryFlag from "react-country-flag";
import Tag from "../Common/Tag";
import WithNavbar from "../Common/WithNavbar";

//icons
import { BiFemaleSign, BiMaleSign } from "react-icons/bi";

//others
import { MAX_ARTIST_RATING } from "../../constants-and-settings";

const Artist = ({ match }) => {
  const { loading, error, data } = useQuery(ARTIST_DETAILS_QUERY, {
    variables: { artistMBID: match.params.artistMBID },
  });

  const RenderHeader = () => {
    if (!data) return null;
    const {
      country,
      mbid,
      disambiguation,
      gender,
      lifeSpan,
      mediaWikiImages,
      name,
      tags,
      type,
      rating,
    } = data?.lookup?.artist;
    const imgUrl = mediaWikiImages[0]?.url;
    const imgAlt = mediaWikiImages[0]?.descriptionHTML;

    //the following informations will be displayed in a list style, besides the image on x-large screens and below it elswhere
    const tagNames = tags?.edges
      .filter((edge) => edge.node.count > 0)
      .sort((edgeA, edgeB) => edgeB.node.count - edgeA.node.count)
      .map((edge) => edge.node.name)
      .slice(0, 10);
    const beginInfo = {
      id: "begin",
      label: type === "Group" ? "Founded on" : "Birthday",
      value: lifeSpan?.begin || null,
    };
    const endInfo = {
      id: "end",
      label: type === "Group" ? "Dissolved on" : "Date of death",
      value: lifeSpan?.end || null,
    };
    const genderInfo = {
      id: "gender",
      label: "Gender",
      value:
        gender === "male" ? (
          <BiMaleSign className="text-lg" />
        ) : gender === "female" ? (
          <BiFemaleSign className="text-lg" />
        ) : null,
    };
    const countryInfo = {
      id: "country",
      label: "Country",
      value: country ? (
        <div className="flex items-center space-x-1">
          <span>{country}</span>
          <ReactCountryFlag countryCode={country} aria-label={country} />
        </div>
      ) : null,
    };

    const tagsInfo = {
      id: "tags",
      label: "Tags",
      value: tagNames.length ? (
        <div className="mt-1 flex flex-wrap">
          {tagNames.map((tag, index) => {
            return <Tag text={tag} key={index} />;
          })}
        </div>
      ) : null,
    };

    return (
      <div className="flex flex-col xl:flex-row space-y-4 xl:items-end  xl:space-x-6 xl:space-y-0 w-full relative">
        {imgUrl && (
          <img
            className="max-h-96 object-contain rounded-2xl"
            src={imgUrl}
            alt={imgAlt || `A photo of ${name}`}
          />
        )}

        <div className="flex flex-col space-y-3">
          {/* Name and disambiguation */}
          <div>
            <Heading
              level={1}
              text={`${name} ${type === "Group" ? "(Group)" : ""}`}
            />
            {disambiguation && (
              <p className="italic font-lg">{disambiguation}</p>
            )}
          </div>
          {/* Personal info */}
          {[countryInfo, beginInfo, endInfo, genderInfo, tagsInfo].map(
            (info) => {
              if (!info.value) {
                return null;
              }
              return (
                <div
                  key={info.id}
                  className="flex flex-wrap space-x-2 items-center"
                >
                  <span className="font-medium">{info.label}:</span>
                  <div>{info.value}</div>
                </div>
              );
            }
          )}
          {/* Rating and add to favorites */}
          <div className="flex space-x-4 items-center">
            {rating?.value && (
              <RatingDisk rating={[rating.value, MAX_ARTIST_RATING]} />
            )}
            <AddToFavorites name={name} type={type} artistMBID={mbid} />
          </div>
        </div>
      </div>
    );
  };

  const RenderReleases = () => {
    const { releases, mbid } = data?.lookup?.artist;
    return (
      <div className="flex flex-col space-y-3">
        <Heading
          level={2}
          text={releases.edges.length ? "Featured Releases" : "No Releases"}
        />
        <ListOfReleases releases={releases.edges} artistMBID={mbid} />
      </div>
    );
  };

  //3 possible scenarios for conditional rendering depending on the data
  const RenderLoading = () => {
    return (
      <div className="w-full">
        <Loader />
      </div>
    );
  };
  const RenderError = () => {
    return (
      <div>
        <Alert
          message="There was a problem fetching the Artist's information"
          type="error"
        />
      </div>
    );
  };
  const RenderMainContent = () => {
    return (
      <div className="w-full flex flex-col space-y-10">
        {RenderHeader()}
        {RenderReleases()}
      </div>
    );
  };
  const ConditionalRendering = () => {
    if (error) return RenderError();
    if (loading) return RenderLoading();
    return RenderMainContent();
  };
  return (
    <WithNavbar>
      <div className="w-full flex flex-col space-y-10">
        {ConditionalRendering()}
      </div>
    </WithNavbar>
  );
};
export default Artist;

/*
Notes:
-The images are to be optimized. check again if there are small size images in the database
*/
