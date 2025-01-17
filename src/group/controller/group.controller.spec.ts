import { Test, TestingModule } from "@nestjs/testing";
import { GroupController } from "./group.controller";
import { GroupService } from "../service/group.service";
import { AdminAccessGuard, ModeratorAccessGuard, UserAccessGuard } from "../../share/guards/group-access.guard";
import { GroupMemberDto } from "../dto/group-member.dto";
import { OwnerAccessGuard } from "../../share/guards/owner-access.guard";
import { AddGroupDto } from "../dto/add-group.dto";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { FullGroupData, Group, GroupAccess, GroupPreview, Roles } from "../group.types";
import { HttpStatus } from "@nestjs/common";
import { GroupErrors } from "../errors/group-errors.class";
import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";

describe("GroupController", () => {
  let controller: GroupController;
  let service: GroupService;

  const mockGroupService = {
    getGroup: jest.fn(),
    getGroupsPreviews: jest.fn(),
    createGroup: jest.fn(),
    startAddingMember: jest.fn(),
    finishAddingMember: jest.fn(),
    createDraftOffer: jest.fn(),
    publishOfferWithoutDraft: jest.fn(),
    copyOffersToUser: jest.fn(),
    moveOffersToUser: jest.fn(),
    publishDraftOffer: jest.fn(),
    unpublishPublicOffer: jest.fn(),
    draftifyPublicOffer: jest.fn(),
    duplicateDraftOffer: jest.fn(),
    removeOfferFromGroup: jest.fn(),
    removeUserFromGroup: jest.fn(),
    deleteGroup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [{ provide: GroupService, useValue: mockGroupService }],
    })
      .overrideGuard(OwnerAccessGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(AdminAccessGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(ModeratorAccessGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(UserAccessGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<GroupController>(GroupController);
    service = module.get<GroupService>(GroupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getGroup", () => {
    it("should return a group successfully", async () => {
      const groupId = "1";
      const expectedGroup: Group = { _id: "1", name: "Test Group", publicOffers: [], draftOffers: [], settings: {} };

      jest.spyOn(service, "getGroup").mockResolvedValue(expectedGroup);

      const result = await controller.getGroup(groupId);
      expect(result).toEqual(expectedGroup);
      expect(service.getGroup).toHaveBeenCalledWith(groupId);
    });

    it("should throw a custom error if group is not found", async () => {
      const groupId = "1";

      jest.spyOn(service, "getGroup").mockRejectedValue(new Error("Group not found"));

      try {
        await controller.getGroup(groupId);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.GET_GROUP + "Group not found");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("getGroupsPreviews", () => {
    it("should return group previews successfully", async () => {
      const userId = "1";
      const expectedPreviews: GroupPreview[] = [
        {
          _id: "1",
          name: "Test Group",
          role: Roles.USER,
        },
      ];

      jest.spyOn(service, "getGroupsPreviews").mockResolvedValue(expectedPreviews);

      const result = await controller.getGroupsPreviews(userId);
      expect(result).toEqual(expectedPreviews);
      expect(service.getGroupsPreviews).toHaveBeenCalledWith(userId);
    });

    it("should throw a custom error if an error occurs while fetching previews", async () => {
      const userId = "1";

      jest.spyOn(service, "getGroupsPreviews").mockRejectedValue(new Error("Error fetching previews"));

      try {
        await controller.getGroupsPreviews(userId);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.GET_GROUPS_PREVIEWS + "Error fetching previews");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("createGroup", () => {
    it("should create a group successfully", async () => {
      const userId = "1";
      const createGroupDto: AddGroupDto = { name: "Test Group" };

      jest.spyOn(service, "createGroup").mockResolvedValue("Group created");

      const result = await controller.createGroup(userId, createGroupDto);
      expect(result).toBe("Group created");
      expect(service.createGroup).toHaveBeenCalledWith(userId, createGroupDto);
    });

    it("should throw a custom error if group creation fails", async () => {
      const userId = "1";
      const createGroupDto: AddGroupDto = { name: "Test Group" };

      jest.spyOn(service, "createGroup").mockRejectedValue(new Error("Creation failed"));

      try {
        await controller.createGroup(userId, createGroupDto);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.POST_CREATE_GROUP + "Creation failed");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("startAddingMember", () => {
    it("should start adding a member successfully", async () => {
      const groupId = "1";
      const groupMember: GroupMemberDto = { user_id: "2", email: "sds@sd.ru", role: Roles.USER };

      jest.spyOn(service, "startAddingMember").mockResolvedValue(undefined);

      await controller.startAddingMember(groupId, groupMember);
      expect(service.startAddingMember).toHaveBeenCalledWith(groupId, groupMember);
    });

    it("should throw a custom error if member adding fails", async () => {
      const groupId = "1";
      const groupMember: GroupMemberDto = { user_id: "2", email: "sds@sd.ru", role: Roles.USER };

      jest.spyOn(service, "startAddingMember").mockRejectedValue(new Error("Failed to start adding member"));

      try {
        await controller.startAddingMember(groupId, groupMember);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.POST_START_ADDING_MEMBER + "Failed to start adding member");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("createDraftOffer", () => {
    it("should create a draft offer successfully", async () => {
      const groupId = "1";
      const draftOfferDto: DraftOfferDto = { name: "Test Offer", body: {}, _id: "sdsdsd" };

      jest.spyOn(service, "createDraftOffer").mockResolvedValue("Draft created");

      const result = await controller.createDraftOffer(groupId, draftOfferDto);
      expect(result).toBe("Draft created");
      expect(service.createDraftOffer).toHaveBeenCalledWith(groupId, draftOfferDto);
    });

    it("should throw a custom error if draft creation fails", async () => {
      const groupId = "1";
      const draftOfferDto: DraftOfferDto = { name: "Test Offer", body: {}, _id: "sdsdsd" };

      jest.spyOn(service, "createDraftOffer").mockRejectedValue(new Error("Failed to create draft"));

      try {
        await controller.createDraftOffer(groupId, draftOfferDto);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.POST_CREATE_DRAFT + "Failed to create draft");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("publishOfferWithoutDraft", () => {
    it("should publish the offer without a draft successfully", async () => {
      const groupId = "1";
      const draftOfferDto: DraftOfferDto = { name: "Test Offer", body: {}, _id: "sdsdsd" };

      jest.spyOn(service, "publishOfferWithoutDraft").mockResolvedValue("Offer published");

      const result = await controller.publishOfferWithoutDraft(groupId, draftOfferDto);
      expect(result).toBe("Offer published");
      expect(service.publishOfferWithoutDraft).toHaveBeenCalledWith(groupId, draftOfferDto);
    });

    it("should throw a custom error if publishing offer fails", async () => {
      const groupId = "1";
      const draftOfferDto: DraftOfferDto = { name: "Test Offer", body: {}, _id: "sdsdsd" };

      jest.spyOn(service, "publishOfferWithoutDraft").mockRejectedValue(new Error("Failed to publish offer"));

      try {
        await controller.publishOfferWithoutDraft(groupId, draftOfferDto);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.POST_PUBLISH_OFFER_WITHOUT_DRAFT + "Failed to publish offer");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("publishDraftOffer", () => {
    it("should publish draft offer successfully", async () => {
      const groupId = "1";
      const offerId = "123";
      const expectedMessage = "Offer published successfully";

      jest.spyOn(service, "publishDraftOffer").mockResolvedValue(expectedMessage);

      const result = await controller.publishDraftOffer(groupId, offerId);
      expect(result).toEqual(expectedMessage);
      expect(service.publishDraftOffer).toHaveBeenCalledWith(groupId, offerId);
    });

    it("should throw an error if publishing draft offer fails", async () => {
      const groupId = "1";
      const offerId = "123";

      jest.spyOn(service, "publishDraftOffer").mockRejectedValue(new Error("Failed to publish offer"));

      try {
        await controller.publishDraftOffer(groupId, offerId);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.PUT_PUBLISH_DRAFT + "Failed to publish offer");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("copyOffersToUser", () => {
    it("should copy offers to user successfully", async () => {
      const groupId = "1";
      const userId = "456";
      const moveOffersRequestDto: MoveOffersRequestDto = { draftOffersToMove: ["123", "456"] };

      jest.spyOn(service, "copyOffersToUser").mockResolvedValue(undefined);

      await controller.copyOffersToUser(groupId, userId, moveOffersRequestDto);

      expect(service.copyOffersToUser).toHaveBeenCalledWith(groupId, userId, moveOffersRequestDto);
    });

    it("should throw an error if copying offers fails", async () => {
      const groupId = "1";
      const userId = "456";
      const moveOffersRequestDto: MoveOffersRequestDto = { publicOffersToMove: ["123", "456"] };

      jest.spyOn(service, "copyOffersToUser").mockRejectedValue(new Error("Failed to copy offers"));

      try {
        await controller.copyOffersToUser(groupId, userId, moveOffersRequestDto);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.PUT_COPY_OFFER_TO_USER + "Failed to copy offers");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("moveOffersToUser", () => {
    it("should move offers to user successfully", async () => {
      const groupId = "1";
      const userId = "456";
      const moveOffersRequestDto: MoveOffersRequestDto = { publicOffersToMove: ["123", "456"] };

      jest.spyOn(service, "moveOffersToUser").mockResolvedValue(undefined);

      await controller.moveOffersToUser(groupId, userId, moveOffersRequestDto);

      expect(service.moveOffersToUser).toHaveBeenCalledWith(groupId, userId, moveOffersRequestDto);
    });

    it("should throw an error if moving offers fails", async () => {
      const groupId = "1";
      const userId = "456";
      const moveOffersRequestDto: MoveOffersRequestDto = { draftOffersToMove: ["123", "456"] };

      jest.spyOn(service, "moveOffersToUser").mockRejectedValue(new Error("Failed to move offers"));

      try {
        await controller.moveOffersToUser(groupId, userId, moveOffersRequestDto);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.PUT_MOVE_OFFER_TO_USER + "Failed to move offers");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("unpublishPublicOffer", () => {
    it("should unpublish public offer successfully", async () => {
      const groupId = "1";
      const offerId = "123";
      const expectedMessage = "Offer unpublished successfully";

      jest.spyOn(service, "unpublishPublicOffer").mockResolvedValue(expectedMessage);

      const result = await controller.unpublishPublicOffer(groupId, offerId);
      expect(result).toEqual(expectedMessage);
      expect(service.unpublishPublicOffer).toHaveBeenCalledWith(groupId, offerId);
    });

    it("should throw an error if unpublishing public offer fails", async () => {
      const groupId = "1";
      const offerId = "123";

      jest.spyOn(service, "unpublishPublicOffer").mockRejectedValue(new Error("Failed to unpublish offer"));

      try {
        await controller.unpublishPublicOffer(groupId, offerId);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.PUT_UNPUBLISH_PUBLIC + "Failed to unpublish offer");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("draftifyPublicOffer", () => {
    it("should draftify public offer successfully", async () => {
      const groupId = "1";
      const offerId = "123";
      const expectedMessage = "Offer moved to draft successfully";

      jest.spyOn(service, "draftifyPublicOffer").mockResolvedValue(expectedMessage);

      const result = await controller.draftifyPublicOffer(groupId, offerId);
      expect(result).toEqual(expectedMessage);
      expect(service.draftifyPublicOffer).toHaveBeenCalledWith(groupId, offerId);
    });

    it("should throw an error if draftifying public offer fails", async () => {
      const groupId = "1";
      const offerId = "123";

      jest.spyOn(service, "draftifyPublicOffer").mockRejectedValue(new Error("Failed to draftify offer"));

      try {
        await controller.draftifyPublicOffer(groupId, offerId);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.PUT_DRAFTIFY_PUBLIC + "Failed to draftify offer");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("duplicateDraftOffer", () => {
    it("should duplicate draft offer successfully", async () => {
      const groupId = "1";
      const offerId = "123";
      const expectedMessage = "Offer duplicated successfully";

      jest.spyOn(service, "duplicateDraftOffer").mockResolvedValue(expectedMessage);

      const result = await controller.duplicateDraftOffer(groupId, offerId);
      expect(result).toEqual(expectedMessage);
      expect(service.duplicateDraftOffer).toHaveBeenCalledWith(groupId, offerId);
    });

    it("should throw an error if duplicating draft offer fails", async () => {
      const groupId = "1";
      const offerId = "123";

      jest.spyOn(service, "duplicateDraftOffer").mockRejectedValue(new Error("Failed to duplicate offer"));

      try {
        await controller.duplicateDraftOffer(groupId, offerId);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.PUT_DUPLICATE_DRAFT + "Failed to duplicate offer");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("removeOfferFromGroup", () => {
    it("should remove offer from group successfully", async () => {
      const groupId = "1";
      const offerId = "123";
      const expectedOffer: DraftOfferDto = { name: "Test Offer", body: {}, _id: "sdsdsd" };

      jest.spyOn(service, "removeOfferFromGroup").mockResolvedValue(expectedOffer);

      const result = await controller.removeOfferFromGroup(groupId, offerId);
      expect(result).toEqual(expectedOffer);
      expect(service.removeOfferFromGroup).toHaveBeenCalledWith(groupId, offerId);
    });

    it("should throw an error if removing offer fails", async () => {
      const groupId = "1";
      const offerId = "123";

      jest.spyOn(service, "removeOfferFromGroup").mockRejectedValue(new Error("Failed to remove offer"));

      try {
        await controller.removeOfferFromGroup(groupId, offerId);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.DELETE_DRAFT_OFFER + "Failed to remove offer");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("removeUserFromGroup", () => {
    it("should remove user from group successfully", async () => {
      const groupId = "1";
      const userId = "456";
      const expectedGroupAccess: GroupAccess = { group_id: "1", user_id: "456", role: Roles.USER };

      jest.spyOn(service, "removeUserFromGroup").mockResolvedValue(expectedGroupAccess);

      const result = await controller.removeUserFromGroup(groupId, userId);
      expect(result).toEqual(expectedGroupAccess);
      expect(service.removeUserFromGroup).toHaveBeenCalledWith(groupId, userId);
    });

    it("should throw an error if removing user fails", async () => {
      const groupId = "1";
      const userId = "456";

      jest.spyOn(service, "removeUserFromGroup").mockRejectedValue(new Error("Failed to remove user"));

      try {
        await controller.removeUserFromGroup(groupId, userId);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.DELETE_USER + "Failed to remove user");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe("deleteGroup", () => {
    it("should delete group successfully", async () => {
      const groupId = "1";
      const group: Group = { _id: "1", name: "Test Group", publicOffers: [], draftOffers: [], settings: {} };
      const groupAccesses: GroupAccess[] = [{ group_id: "1", user_id: "456", role: Roles.USER }];
      const expectedFullGroupData: FullGroupData = { group, groupAccesses };

      jest.spyOn(service, "deleteGroup").mockResolvedValue(expectedFullGroupData);

      const result = await controller.deleteGroup(groupId);
      expect(result).toEqual(expectedFullGroupData);
      expect(service.deleteGroup).toHaveBeenCalledWith(groupId);
    });

    it("should throw an error if deleting group fails", async () => {
      const groupId = "1";

      jest.spyOn(service, "deleteGroup").mockRejectedValue(new Error("Failed to delete group"));

      try {
        await controller.deleteGroup(groupId);
      } catch (error) {
        expect(error.response).toBe(GroupErrors.DELETE_GROUP + "Failed to delete group");
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
