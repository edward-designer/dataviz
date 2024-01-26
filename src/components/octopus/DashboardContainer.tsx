"use client";

import { useContext } from "react";

import { UserContext } from "@/context/user";
import UserApi from "./UserApi";
import Image from "next/image";

import compareGif from "../../../public/images/compare.gif";
import DashboardContents from "./DashboardContents";

export type ErrorType = Record<string, string>;

const DashboardContainer = () => {
  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return hasApiInfo ? (
    <DashboardContents />
  ) : (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="">
        <UserApi />
      </div>
      <div className="flex justify-center mt-8 md:mt-0">
        <Image
          src={compareGif}
          className="w-[300px] h-auto border border-accentBlue-500 "
          alt="demo showing how the account dashboard"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCANrAf0DASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAEEAgX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APFAdmwAAAAAAAAAAAAAAAFAEAAAAFRUAAAAAAFAAVFQABAAFAAAQUAAAAAFAAAQUAAAAAAAAAGcB0aAAAAAAAAAAAAAAABFAAAAAAVFQAAAAAAUABUERQAAAURQAEFAAAAABQEAAFAAAAAAAAABnAdGgAAAAAAAAAAAAAAARRFAAAAAABRFQAAAAUAABEUAAABUVAABRFAAAABQEAAFEUAAAAAAAAGcB0aAAAAAAAAAAAAABAABUAUQBQAAEBUAUAAABUUABEFRQAAAAUBAVAFAAAAVFQAAAAUQBRFAAAABnAdGgAAAAAAAAAAAAAQAAAAAAVFAAQAAURQAAFQBQEQABQAAEFEUAABUUAABUEFAAAAAAAAVAFEAZwHRoAAABRAFQAAAFQEURQAAAAAAAAFQQUAAAFEUAAQVBBQAURQAEBUAUAAAFAAAQAAURQAAAAAAAAZwHRoAAAAAAAAAEAAAAUQBRAFAAAAAQFQBQAAAUAQAQURQAAFRUAABUAUABUEFAAAAAAVAFAAAAABmAdGgAAAAAQVAFEAUAAAAAAAAAFEEFAAAAVAFAAAEURUAAFEUABBQAAAFRQAEAAFEUAAAAAAFEAUQBnAdFAAAAAAAAAAAAAAAAUQBQAAEBUAUQBQAFQEURUBUAURQAAURUAAFEUAAFEEFAAABRAFEUAAAAQABnEHRpRAFEAUQBRAFEAUQBQAAAAAAAFQQUAAABUBFAAAQUAAAFEUABBRFAABRFAARBUAUAAAAAAABUAUQBnEHRpRAFEUAAAAAAAAAAAAAAFEVAAAAEFQBQAAAURUAAFEUAAFEVAABRFAAEFQQUAAAAAFEAUAAAAAGYB0aAAAAAAAAAAAAAAUQBRFAAQFQBRARQAAAURQFQQUQBQAFQQUAFEAUAQVAFAQAAUQBQAAAAAFQBRAGcQdGlEAUQBRAFEAUQBRAFEUAAABAVARRAFAAVAFEAUBBRAFABRAFEVAVARRFAVAFEVAABRAFAAABRAFEAUQQUQBnEHVpRAFEAUQBRFAAAAEABQBEFQBRAFAAABRAFAAVBBRFAVAFEUABEURQAAUQBQEBUAUAAAFEAUQBQEAAAAGYQdVUQBRAFEEFEAUAAAAAAAFEAURQAAFQBRFAAQUQBQAUQBQERRAFAAVAFEVAVAFEUAABUAURQAEAAAAAAGYB0UAAAAAAAAAAAAVAFEAUQBRFAAAVAFAAAQURQFQBRFEFQQUQBQAURQAEFEUAABUAURQAAAEAABUAUQBmEV0UAAAAAAAAAAVAFEAUQBRAFAAVAFEAURQFQQUABUBFEUBUEFEUBUAURQFQQURQAAUQBRFEAEBUAUQBRFAABlAdFAAAAAAABQAAAFEAUQBRFAABRAFEAUBEUQBRFAVAFEVAVAFAAVAFAQFQBQAFQEUQBQAFQQUQBRAFEUAAGUQdFUQBRAFEAUAAAAAAAFEAUQBQAFQBRFQFQBRAFABRAFAQURQAAUQBQEFEUAAQVAFEAUBAVAFEAUAAAAAGUQdFUQBRAFEAUQBRAFEUAAFEAUQBRFAVAFEEFABRAFVAFEEFVAFEAVUAUQQVUAUQEUAFEAURUAAFEAURQAAAAAAZAHQAAAAUQBRAFEAUQFUAAAFEAURQAEFEAUAFEAUAFEVAVAFEUBUBFEVAVAFEUBUAUQQUAFEAUQBQBAAAAAAGQQdFUQBRFAAAVAFEAUQBRAFAAVAVRBBVQBRAFEUFEAUAFEEFVAFEUQVAFEVAVAFEUBUAUQQUABUBFEAURQAAAAAAZBB0FEAUQBRAFEAUQFUAFEAUQBRFBRBBQBRUAUAFEAURUFEAUARRFAVBBRFAVAFEUBUEFEUQABRAFEUAAABAAAABjEHVFEAUQBRAFEAdCAqiAKIAqoCqIAqoIKIAqoAoigKggoAKIAqoAogCqggoACoAoACoIigAAAogCiAKAgAAAAAAxAOrIAAAAAAqAKICqIAqoCqIAqoAogiqqAKIoKIAqoIKIoKIAqoAoioCoAoigogIoCCiAKIoCoAogCgIAAAAgAAADEA6gAAAAAAAAAAACiAKIoKICqqCCiKCiKKKgCqggoigogCqggoigKgCgCKIIKACiAKIoCoAogiKIoAACoAogCiAMQg6KogCiAiiKAAAAAAoogCiAKqAKIIOhAVVQBVQQURRVEUBUAUBBRFEUQBQAUQQUAFEAUAFEERRFAAAABRAFEAUQBiEHRVEAUQBRFAAAAAABRAFEAUAQVAFVyoKIoqq5VBRFBRAFVBBVQBRFAVAFAQURQAAURQAERRAFEUAABUAUQBRAFEAYhBtpRFAAAAAAAAUFQBRAFEUQAAVAFAEURQUQRXQigogDoQQVUAUAFEVAVAFAAVAFARBUAURQAAAAFQBRFEAEAAGEBtsAAAAAUAAAAFQBRAFAAABRFEFQBRFBRFEFRRRUVAVFAVAFAQUAFEAUAFEVEFQBRAFAAABRAFEERRFAAAABiEGnRRAFEUAAABQAAAAAAAVFEAUAFEUQABRFBRFEURUVRFAVFQFRQFQBQAFQRFABRAFAAABRBBRFEAAAAAAAAYgFdAAAAAAABRRAFEUAAABQAAVARRFAVAFAEUARRFFUAFAQURQFRQAERQAFQBQAFQBRFQABAAFEAUQBRAFEAYwFdAAAAAAAAAAAABUFFEUAAABQVARQAURRBUAVUUBUVAVAFVAFAQURRBUAUABUEFAAABRAFAEAAAAAEAAGMBp0AAAAAAAAAAAAAAAAFQUURQAAURVQVAFARFABQAUAFAQUABUBFAAVFQAAFRQAAAAFQBRFRAAAAAAGMBp0AAAAAAAAAAAAAAAAAAAFFEUAARQAUARQAUBBRFAVFAVFAAQUAAARQAAAUBAAAAAAABREFAQUBjAadAAAAAAAAAAAAAAAAAAAAABRQBFAAVFEFRUFABQAFRQFRUAAFAAABQAAEQUAAAAAAAAAUQBQAYwGmwAAAAAAAAAAAAAAAAAAAAAFAEUABUUBQBQAUARQEBUUAFAAAVFAAQAAUAAAQAAAAAAAAABkAabAAAAAAAAAAAAAAAAAAAAAUAARQAUAFBQAUAFQAAUABUUABEFAAAAFAAAAAAAAQFQBQAAAYwG2gAAAAAAAAAAAAAAAAAAABUUAFEFRQFRQFRQFRUBUUAFAAAUEAAFAAAAUBAAAAABBQAAAAAAAYwG2gAAAAAAAAAAAAAAAAAAABUUBQAUAUAFBUAFAAAUAAUQAQFAAABUUAAAAAFQABAAAAAAAAGMBtoAAAAAAAAAAAAAAAAAAFAFRQAUBQAUAFBAUAFRQAAUBABQABBUUAAAABUVAAAAAAAAABQQUBiAbUAAAAAAAAAAAAAABQRQAAFUFABQAUAFABUQBQAAFAAFQAAAUAAAAAUEAEAAAFAAAAAAAABiAbUAAAAAAAAAAAAFAABQABQBQAFAFABQAUBAUAFRRAFBFBABQAAAAFAAAABAUAAAABAAAAAAGIBtQAAAAAAFBBQAAUAABVAAUUAFBAUBBQAUAFRUAFAAAUBABAUAAAFAAABUUAAABAAAAAAAAAABiFGxBQAAUAAAAAAFFAAUAAVFABQFRUBUUBUUQBQAEBQAFAAAFBAAAUBAAAUAAAAAAQAUEUAAAAAAAYgG1BQEFFEFBUUAAAAAAUEUBQFABRAFQAAUAFAEFBABQAAFAABAUAAABQQAAAABQRQQAAAAAAAAAAYwHRoAAAAAABQQUFAAAAAAFABQAUBBQQFRQFRQAERQAAUAABQAAQFRQAAAAAAUAQAFAEAAAFBBQEFAYhR0aAAAAAAAAAAAAAFBUUBUVAVFAVFEAVAABQAFRQAERQAAUAAABBQAAAAUEUAAAAAAUABAAAAAABjAdGgAAAAAABQAAFBUUAAAUBEUAFABQEQVFABQAAFRUAAQVFAABQAAEAAFAAAABQAAAAAEAAAAAAGMB1aAAAUVBQEUAAAAAAAFRQFRUQBQAUAFRAABQABQAEBUUAAQVFAAQAUEUAAAAAUAAAAAABAAAAAABkAdWwAAAAAAAAAAAAAFAAUBBQQFRQFRUQABQAFRQAEBQABRAAABAVFAAAAABQAAAAAAAAAAAAAAZAHRsAAAAAAAAAAAAVFABQAAUBEUABUVEFRQAAUAAFQAAFRQABAAFAQAAFAAAAAAAAAAAAAAUAAQYwHVsAAAAAAAAAAAAVFAVFAVFABUQABQEQUAFRQAAFRUAABUUAAQBQAEAAFAAAAAAAAAAAABQAAAAYwHRsAAAAAAAAAAAFUAQVFAVFAVFRAAFARFAAVFAABQEAAFAAAAVFEAEAAFAAAAAAAAAABQAAAAAAYwHRsAAAAAAAAAFFRQABBUUBUUBUVEAAUBEUABUUAAFAQAAUAAAFARAAAAFAAAAAAAAAAUAAAAAAAf/9k="
        />
      </div>
    </div>
  );
};

export default DashboardContainer;
