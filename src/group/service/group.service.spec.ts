import { Test, TestingModule } from "@nestjs/testing";
import { GroupService } from "./group.service";
import { MailService } from "../../share/services/mailing.service";
import { OfferService } from "../../offer/service/offer.service";
import { UserService } from "../../authentication/service/user.service";
import GroupModel from "../persistanse/group.model";
import GroupAccessModel from "../persistanse/group-access.model";
import AddUserToGroupTokenModel from "../persistanse/add-user-to-group-token.model";
import { BadRequestException, HttpException } from "@nestjs/common";
import { Roles } from "../group.types";

jest.mock("../persistanse/group.model");
jest.mock("../persistanse/group-access.model");
jest.mock("../persistanse/add-user-to-group-token.model");

describe("GroupService", () => {
  let groupService: GroupService;
  let mailService: MailService;
  let offerService: OfferService;
  // let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: MailService,
          useValue: { sendMailWithHtmlFromNoReply: jest.fn() },
        },
        {
          provide: OfferService,
          useValue: {
            addNewOffer: jest.fn(),
            publishOfferWithoutDraft: jest.fn(),
            publishOfferFromDraft: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            addOffersIdsToUser: jest.fn(),
            removeOffersIdsFromUser: jest.fn(),
          },
        },
      ],
    }).compile();

    groupService = module.get<GroupService>(GroupService);
    mailService = module.get<MailService>(MailService);
    offerService = module.get<OfferService>(OfferService);
    // userService = module.get<UserService>(UserService);
  });

  describe("getGroup", () => {
    it("should return a group", async () => {
      const group = { _id: "group1", name: "Test Group", draft_offers: [], public_offers: [], settings: {} };
      jest.spyOn(groupService as any, "findGroupById").mockResolvedValue(group);

      const result = await groupService.getGroup("group1");
      expect(result).toEqual({
        _id: "group1",
        name: "Test Group",
        draftOffers: [],
        publicOffers: [],
        settings: {},
      });
    });

    it("should throw an exception if group is not found", async () => {
      jest.spyOn(groupService as any, "findGroupById").mockRejectedValue(new Error("Group not found"));

      await expect(groupService.getGroup("invalid_id")).rejects.toThrow(HttpException);
    });
  });

  describe("createGroup", () => {
    it("should create a group and return its ID", async () => {
      const groupId = "group1";
      jest.spyOn(GroupModel.prototype, "save").mockResolvedValue({ _id: groupId });
      jest.spyOn(GroupAccessModel.prototype, "save").mockResolvedValue({});

      const result = await groupService.createGroup("user1", { name: "New Group" });
      expect(result).toBe(groupId);
    });

    it("should throw an exception if creation fails", async () => {
      jest.spyOn(GroupModel.prototype, "save").mockRejectedValue(new Error("Database error"));

      await expect(groupService.createGroup("user1", { name: "New Group" })).rejects.toThrow(HttpException);
    });
  });

  describe("startAddingMember", () => {
    it("should start adding a member to a group", async () => {
      jest.spyOn(groupService as any, "findGroupById").mockResolvedValue({});
      jest.spyOn(GroupAccessModel, "findOne").mockResolvedValue(null);
      jest.spyOn(AddUserToGroupTokenModel.prototype, "save").mockResolvedValue({});
      jest.spyOn(mailService, "sendMailWithHtmlFromNoReply").mockResolvedValue(undefined);

      await expect(
        groupService.startAddingMember("group1", { user_id: "user1", email: "test@example.com", role: Roles.USER }),
      ).resolves.not.toThrow();
    });

    it("should throw an exception if the user is already a member", async () => {
      jest.spyOn(groupService as any, "findGroupById").mockResolvedValue({});
      jest.spyOn(GroupAccessModel, "findOne").mockResolvedValue({});

      await expect(
        groupService.startAddingMember("group1", { user_id: "user1", email: "test@example.com", role: Roles.USER }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("publishOfferWithoutDraft", () => {
    it("should publish an offer without draft", async () => {
      jest.spyOn(groupService as any, "findGroupById").mockResolvedValue({
        public_offers: [],
        save: jest.fn().mockResolvedValue(undefined),
      });
      jest.spyOn(offerService, "publishOfferWithoutDraft").mockResolvedValue("offer1");

      const result = await groupService.publishOfferWithoutDraft("group1", { _id: "", body: undefined, name: "Offer" });
      expect(result).toBe("offer1");
    });

    it("should throw an exception if publishing fails", async () => {
      jest.spyOn(groupService as any, "findGroupById").mockResolvedValue({});
      jest.spyOn(offerService, "publishOfferWithoutDraft").mockRejectedValue(new Error("Publishing failed"));

      await expect(
        groupService.publishOfferWithoutDraft("group1", {
          _id: "",
          body: undefined,
          name: "Offer",
        }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("publishDraftOffer", () => {
    it("should publish an offer from draft", async () => {
      jest.spyOn(groupService as any, "findGroupById").mockResolvedValue({
        draft_offers: ["draft1"],
        public_offers: [],
        save: jest.fn().mockResolvedValue(undefined),
      });
      jest.spyOn(offerService, "publishOfferFromDraft").mockResolvedValue("offer1");

      const result = await groupService.publishDraftOffer("group1", "draft1");
      expect(result).toBe("offer1");
    });

    it("should throw an exception if draft is not found", async () => {
      jest.spyOn(groupService as any, "findGroupById").mockResolvedValue({
        draft_offers: [],
      });

      await expect(groupService.publishDraftOffer("group1", "draft1")).rejects.toThrow(HttpException);
    });
  });

  describe("deleteGroup", () => {
    it("should delete a group", async () => {
      jest.spyOn(GroupModel, "findByIdAndDelete").mockResolvedValue({});
      jest.spyOn(GroupAccessModel, "deleteMany").mockResolvedValue(undefined);

      await expect(groupService.deleteGroup("group1")).resolves.not.toThrow();
      expect(GroupModel.findByIdAndDelete).toHaveBeenCalledWith("group1");
      expect(GroupAccessModel.deleteMany).toHaveBeenCalledWith({ group_id: "group1" });
    });

    it("should throw an exception if deletion fails", async () => {
      jest.spyOn(GroupModel, "findByIdAndDelete").mockRejectedValue(new Error("Database error"));

      await expect(groupService.deleteGroup("group1")).rejects.toThrow(HttpException);
    });
  });
});
