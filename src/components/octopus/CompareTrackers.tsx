"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import TrackerComparision from "./TrackerComparision";
import UserApi from "./UserApi";
import Image from "next/image";

import compareGif from "../../../public/images/compare.gif";

export type ErrorType = Record<string, string>;

const CompareTariffs = () => {
  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
        Old vs New Tracker Tariffs
      </h1>
      <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
        - get what you would have to pay with the increased price
      </h2>

      {hasApiInfo ? (
        <TrackerComparision />
      ) : (
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="">
            <UserApi />
          </div>
          <div className="flex justify-center mt-8 md:mt-0">
            <Image
              src={compareGif}
              className="w-[300px] h-auto border border-accentBlue-500 "
              alt="demo showing how the savings calculation work"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCANrAf0DASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAEEAgX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APFAdmwAAAAAAAAAAAAAAAFAEAAAAFRUAAAAAAFAAVFQABAAFAAAQUAAAAAFAAAQUAAAAAAAAAGcB0aAAAAAAAAAAAAAAABFAAAAAAVFQAAAAAAUABUERQAAAURQAEFAAAAABQEAAFAAAAAAAAABnAdGgAAAAAAAAAAAAAAARRFAAAAAABRFQAAAAUAABEUAAABUVAABRFAAAABQEAAFEUAAAAAAAAGcB0aAAAAAAAAAAAAABAABUAUQBQAAEBUAUAAABUUABEFRQAAAAUBAVAFAAAAVFQAAAAUQBRFAAAABnAdGgAAAAAAAAAAAAAQAAAAAAVFAAQAAURQAAFQBQEQABQAAEFEUAABUUAABUEFAAAAAAAAVAFEAZwHRoAAABRAFQAAAFQEURQAAAAAAAAFQQUAAAFEUAAQVBBQAURQAEBUAUAAAFAAAQAAURQAAAAAAAAZwHRoAAAAAAAAAEAAAAUQBRAFAAAAAQFQBQAAAUAQAQURQAAFRUAABUAUABUEFAAAAAAVAFAAAAABmAdGgAAAAAQVAFEAUAAAAAAAAAFEEFAAAAVAFAAAEURUAAFEUABBQAAAFRQAEAAFEUAAAAAAFEAUQBnAdFAAAAAAAAAAAAAAAAUQBQAAEBUAUQBQAFQEURUBUAURQAAURUAAFEUAAFEEFAAABRAFEUAAAAQABnEHRpRAFEAUQBRAFEAUQBQAAAAAAAFQQUAAABUBFAAAQUAAAFEUABBRFAABRFAARBUAUAAAAAAABUAUQBnEHRpRAFEUAAAAAAAAAAAAAAFEVAAAAEFQBQAAAURUAAFEUAAFEVAABRFAAEFQQUAAAAAFEAUAAAAAGYB0aAAAAAAAAAAAAAAUQBRFAAQFQBRARQAAAURQFQQUQBQAFQQUAFEAUAQVAFAQAAUQBQAAAAAFQBRAGcQdGlEAUQBRAFEAUQBRAFEUAAABAVARRAFAAVAFEAUBBRAFABRAFEVAVARRFAVAFEVAABRAFAAABRAFEAUQQUQBnEHVpRAFEAUQBRFAAAAEABQBEFQBRAFAAABRAFAAVBBRFAVAFEUABEURQAAUQBQEBUAUAAAFEAUQBQEAAAAGYQdVUQBRAFEEFEAUAAAAAAAFEAURQAAFQBRFAAQUQBQAUQBQERRAFAAVAFEVAVAFEUAABUAURQAEAAAAAAGYB0UAAAAAAAAAAAAVAFEAUQBRFAAAVAFAAAQURQFQBRFEFQQUQBQAURQAEFEUAABUAURQAAAEAABUAUQBmEV0UAAAAAAAAAAVAFEAUQBRAFAAVAFEAURQFQQUABUBFEUBUEFEUBUAURQFQQURQAAUQBRFEAEBUAUQBRFAABlAdFAAAAAAABQAAAFEAUQBRFAABRAFEAUBEUQBRFAVAFEVAVAFAAVAFAQFQBQAFQEUQBQAFQQUQBRAFEUAAGUQdFUQBRAFEAUAAAAAAAFEAUQBQAFQBRFQFQBRAFABRAFAQURQAAUQBQEFEUAAQVAFEAUBAVAFEAUAAAAAGUQdFUQBRAFEAUQBRAFEUAAFEAUQBRFAVAFEEFABRAFVAFEEFVAFEAVUAUQQVUAUQEUAFEAURUAAFEAURQAAAAAAZAHQAAAAUQBRAFEAUQFUAAAFEAURQAEFEAUAFEAUAFEVAVAFEUBUBFEVAVAFEUBUAUQQUAFEAUQBQBAAAAAAGQQdFUQBRFAAAVAFEAUQBRAFAAVAVRBBVQBRAFEUFEAUAFEEFVAFEUQVAFEVAVAFEUBUAUQQUABUBFEAURQAAAAAAZBB0FEAUQBRAFEAUQFUAFEAUQBRFBRBBQBRUAUAFEAURUFEAUARRFAVBBRFAVAFEUBUEFEUQABRAFEUAAABAAAABjEHVFEAUQBRAFEAdCAqiAKIAqoCqIAqoIKIAqoAoigKggoAKIAqoAogCqggoACoAoACoIigAAAogCiAKAgAAAAAAxAOrIAAAAAAqAKICqIAqoCqIAqoAogiqqAKIoKIAqoIKIoKIAqoAoioCoAoigogIoCCiAKIoCoAogCgIAAAAgAAADEA6gAAAAAAAAAAACiAKIoKICqqCCiKCiKKKgCqggoigogCqggoigKgCgCKIIKACiAKIoCoAogiKIoAACoAogCiAMQg6KogCiAiiKAAAAAAoogCiAKqAKIIOhAVVQBVQQURRVEUBUAUBBRFEUQBQAUQQUAFEAUAFEERRFAAAABRAFEAUQBiEHRVEAUQBRFAAAAAABRAFEAUAQVAFVyoKIoqq5VBRFBRAFVBBVQBRFAVAFAQURQAAURQAERRAFEUAABUAUQBRAFEAYhBtpRFAAAAAAAAUFQBRAFEUQAAVAFAEURQUQRXQigogDoQQVUAUAFEVAVAFAAVAFARBUAURQAAAAFQBRFEAEAAGEBtsAAAAAUAAAAFQBRAFAAABRFEFQBRFBRFEFRRRUVAVFAVAFAQUAFEAUAFEVEFQBRAFAAABRAFEERRFAAAABiEGnRRAFEUAAABQAAAAAAAVFEAUAFEUQABRFBRFEURUVRFAVFQFRQFQBQAFQRFABRAFAAABRBBRFEAAAAAAAAYgFdAAAAAAABRRAFEUAAABQAAVARRFAVAFAEUARRFFUAFAQURQFRQAERQAFQBQAFQBRFQABAAFEAUQBRAFEAYwFdAAAAAAAAAAAABUFFEUAAABQVARQAURRBUAVUUBUVAVAFVAFAQURRBUAUABUEFAAABRAFAEAAAAAEAAGMBp0AAAAAAAAAAAAAAAAFQUURQAAURVQVAFARFABQAUAFAQUABUBFAAVFQAAFRQAAAAFQBRFRAAAAAAGMBp0AAAAAAAAAAAAAAAAAAAFFEUAARQAUARQAUBBRFAVFAVFAAQUAAARQAAAUBAAAAAAABREFAQUBjAadAAAAAAAAAAAAAAAAAAAAABRQBFAAVFEFRUFABQAFRQFRUAAFAAABQAAEQUAAAAAAAAAUQBQAYwGmwAAAAAAAAAAAAAAAAAAAAAFAEUABUUBQBQAUARQEBUUAFAAAVFAAQAAUAAAQAAAAAAAAABkAabAAAAAAAAAAAAAAAAAAAAAUAARQAUAFBQAUAFQAAUABUUABEFAAAAFAAAAAAAAQFQBQAAAYwG2gAAAAAAAAAAAAAAAAAAABUUAFEFRQFRQFRQFRUBUUAFAAAUEAAFAAAAUBAAAAABBQAAAAAAAYwG2gAAAAAAAAAAAAAAAAAAABUUBQAUAUAFBUAFAAAUAAUQAQFAAABUUAAAAAFQABAAAAAAAAGMBtoAAAAAAAAAAAAAAAAAAFAFRQAUBQAUAFBAUAFRQAAUBABQABBUUAAAABUVAAAAAAAAABQQUBiAbUAAAAAAAAAAAAAABQRQAAFUFABQAUAFABUQBQAAFAAFQAAAUAAAAAUEAEAAAFAAAAAAAABiAbUAAAAAAAAAAAAFAABQABQBQAFAFABQAUBAUAFRRAFBFBABQAAAAFAAAABAUAAAABAAAAAAGIBtQAAAAAAFBBQAAUAABVAAUUAFBAUBBQAUAFRUAFAAAUBABAUAAAFAAABUUAAABAAAAAAAAAABiFGxBQAAUAAAAAAFFAAUAAVFABQFRUBUUBUUQBQAEBQAFAAAFBAAAUBAAAUAAAAAAQAUEUAAAAAAAYgG1BQEFFEFBUUAAAAAAUEUBQFABRAFQAAUAFAEFBABQAAFAABAUAAABQQAAAABQRQQAAAAAAAAAAYwHRoAAAAAABQQUFAAAAAAFABQAUBBQQFRQFRQAERQAAUAABQAAQFRQAAAAAAUAQAFAEAAAFBBQEFAYhR0aAAAAAAAAAAAAAFBUUBUVAVFAVFEAVAABQAFRQAERQAAUAAABBQAAAAUEUAAAAAAUABAAAAAABjAdGgAAAAAABQAAFBUUAAAUBEUAFABQEQVFABQAAFRUAAQVFAABQAAEAAFAAAABQAAAAAEAAAAAAGMB1aAAAUVBQEUAAAAAAAFRQFRUQBQAUAFRAABQABQAEBUUAAQVFAAQAUEUAAAAAUAAAAAABAAAAAABkAdWwAAAAAAAAAAAAAFAAUBBQQFRQFRUQABQAFRQAEBQABRAAABAVFAAAAABQAAAAAAAAAAAAAAZAHRsAAAAAAAAAAAAVFABQAAUBEUABUVEFRQAAUAAFQAAFRQABAAFAQAAFAAAAAAAAAAAAAAUAAQYwHVsAAAAAAAAAAAAVFAVFAVFABUQABQEQUAFRQAAFRUAABUUAAQBQAEAAFAAAAAAAAAAAABQAAAAYwHRsAAAAAAAAAAAFUAQVFAVFAVFRAAFARFAAVFAABQEAAFAAAAVFEAEAAFAAAAAAAAAABQAAAAAAYwHRsAAAAAAAAAFFRQABBUUBUUBUVEAAUBEUABUUAAFAQAAUAAAFARAAAAFAAAAAAAAAAUAAAAAAAf/9k="
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareTariffs;
