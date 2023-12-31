const express = require("express");
const router = express.Router();
const faker = require("faker");
const auth = require("../../middleware/auth");

const Brick = require("../../models/Brick");
const Donor = require("../../models/Donor");
const User = require("../../models/User");

const bricksID = require("./initialValue.js");
const { randomInt } = require("crypto");
router.get("/test", (req, res) => {
  res.json("test!");
});

router.post("/initial", async (req, res) => {
  let count = 35000;
  try {
    await Brick.deleteMany({});
    let brickArray = [];
    for (let i = 0; i < count; i++) {
      brickArray.push({
        brick_id: bricksID[i],
        sold: false,
      });
    }
    await Brick.insertMany(brickArray);
    res.json(`Successfully initialized ${count} bricks.`);
  } catch (error) {
    console.error("Error inserting fake data:", error);
  }
});
// router.post("/initial", async (req, res) => {
// 	try {
// 		const fakeBricks = [];
// 		const count = 35000;

// 		await Brick.deleteMany({});

// 		const users = await User.find();
// 		let j = 0;
// 		const percent = req.body.count / count;
// 		for (let i = 0; i < count; i++) {
// 			if (Math.random() < percent) {
// 				fakeBricks.push({
// 					user: users[j]._id,
// 					brick_id: bricksID[i],
// 					amount: faker.datatype.number({ max: 10 }),
// 					date: faker.date.past(1),
// 					dedication: {
// 						name: faker.name.findName(),
// 						relationship: faker.lorem.word(),
// 						message: faker.lorem.sentence(),
// 						image: {
// 							imageName: faker.system.fileName(),
// 							imagePath: faker.image.imageUrl(),
// 						},
// 					},
// 					sold: true,
// 					fake: true,
// 				});
// 				j++;
// 			} else {
// 				fakeBricks.push({
// 					brick_id: bricksID[i],
// 					sold: false,
// 				});
// 			}
// 		}

// 		await Brick.insertMany(fakeBricks);
// 		res.json(`Successfully added ${count} fake bricks.`);
// 	} catch (error) {
// 		console.error("Error inserting fake data:", error);
// 	}
// });

//get sold amound for wallofbrick
router.get("/sold-amount", async (req, res) => {
  await Brick.find({ sold: true })
    .count()
    .then((amount) => {
      res.json(amount);
    });
});


router.get("/all", async (req, res) => {
  // await Brick.find()
  //   .then((result) => {
  //     res.json(result);
  //   })
  //   .catch(function (error) {
  //     console.log(error); // Failure
  //   });
  const dataPipeline = [
    {
      $lookup: {
        from: "donors",
        localField: "user",
        foreignField: "user",
        as: "donor",
      },
    },
    {
      $project: {
        brick_id: 1,
        sold: 1,
        date: 1,
        user: 1,
        dedication: 1,
        donor: { $arrayElemAt: ["$donor", 0] },
      },
    },
  ];

  const bricks = await Brick.aggregate(dataPipeline).exec();
  res.json(bricks);
});

const getRandomBrickId = async (amount) => {
  let UnpurchasedIds = await Brick.find({ sold: false });
  let RandomId = [];
  for (let i = 0; i < amount; i++) {
    RandomId.push(
      UnpurchasedIds[Math.floor(Math.random() * UnpurchasedIds.length)].brick_id
    );
  }
  return RandomId;
};

router.post("/buy", async (req, res) => {
  const { brick_id, user, amount } = req.body;

  // Error handling with try-catch
  try {
    const donor = await Donor.find({ user: user });

    // Assume that Brick.updateOne() and getRandomBrickId() return Promises
    let purchasedIds = [brick_id];
    let updatePromises = [
      Brick.updateOne(
        { brick_id },
        {
          $set: {
            user,
            date: new Date(),
            sold: true,
          },
        }
      ),
    ];

    if (amount > 1) {
      const randomIDs = await getRandomBrickId(amount - 1);
      purchasedIds.push(...randomIDs);

      const updateRandomBricks = randomIDs.map((id) =>
        Brick.updateOne(
          { brick_id: id },
          {
            $set: {
              user,
              date: new Date(),
              sold: true,
            },
          }
        )
      );

      updatePromises.push(...updateRandomBricks);
    }

    // Execute all updates simultaneously and wait until they are all done
    await Promise.all(updatePromises);

    res.json({ purchasedIds, user, date: new Date(), donor });
  } catch (error) {
    // Handle errors appropriately
    console.error("Failed to buy bricks:", error);
    res.status(500).json({ message: "Error processing your request" });
  }
});

router.get("/saleInfo/byday", async (req, res) => {
  // Parse query parameters safely, providing defaults if they are invalid.
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;

  const response = await Brick.aggregate([
    {
      $match: {
        date: { $exists: true, $ne: null },
        sold: true,
        $expr: {
          $and: [
            // Use $and to add multiple conditions
            { $eq: [{ $year: "$date" }, year] },
            { $eq: [{ $month: "$date" }, month] },
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        totalSales: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  res.json(response);
});

router.get("/saleInfo/bymonth", async (req, res) => {
  // Parse query parameters safely, providing defaults if they are invalid.
  const year = parseInt(req.query.year) || new Date().getFullYear();

  const response = await Brick.aggregate([
    {
      $match: {
        date: { $exists: true, $ne: null },
        sold: true,
        $expr: { $eq: [{ $year: "$date" }, year] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        totalSales: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  res.json(response);
});

router.get("/current_page", async (req, res) => {
  try {
    let { brick_id, date, amount, page, limit, term } = req.query;
    let filter_query = {};
    let sort_query = {};

    brick_id = parseInt(brick_id);
    date = parseInt(date);
    amount = parseInt(amount);

    if (brick_id !== 0) sort_query.brick_id = brick_id;
    if (date !== 0) sort_query.date = date;
    if (amount !== 0) sort_query.amount = amount;

    // Add text search to filter_query if term is provided
    if (term && term !== "") {
      filter_query.$expr = {
        $or: [
          { $regexMatch: { input: "$brick_id", regex: term, options: "i" } },
          {
            $regexMatch: {
              input: "$donor.fullName",
              regex: term,
              options: "i",
            },
          },
          {
            $regexMatch: {
              input: "$dedication.name",
              regex: term,
              options: "i",
            },
          },
          {
            $regexMatch: {
              input: "$dedication.relationship",
              regex: term,
              options: "i",
            },
          },
          {
            $regexMatch: {
              input: "$dedication.message",
              regex: term,
              options: "i",
            },
          },
        ],
      };
    }

    filter_query.sold = true;

    // Parse 'page' and 'limit' as integers
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    // Define the pipeline to get the total count
    const countPipeline = [
      ...(Object.keys(filter_query).length ? [{ $match: filter_query }] : []),
      { $group: { _id: null, total: { $sum: 1 } } },
      { $project: { _id: 0, total: 1 } },
    ];

    // Execute the count pipeline to get the total number of documents
    const totalCountResult = await Brick.aggregate(countPipeline).exec();
    const totalPages =
      totalCountResult.length > 0
        ? Math.ceil(totalCountResult[0].total / limit)
        : 0;
    // Now define the pipeline to fetch the documents
    const dataPipeline = [
      {
        $lookup: {
          from: "donors",
          localField: "user",
          foreignField: "user",
          as: "donor",
        },
      },
      { $unwind: "$donor" },
      ...(Object.keys(sort_query).length ? [{ $sort: sort_query }] : []),
      ...(Object.keys(filter_query).length ? [{ $match: filter_query }] : []),
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    // Fetch the documents based on the query and pagination options
    const documents = await Brick.aggregate(dataPipeline).exec();
    // Send back the total count along with the documents
    res.json({
      totalPages,
      documents,
      page,
      limit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Express route handler for adding a new Brick with a dedication

router.post("/add-dedication", async (req, res) => {
  try {
    const { brick_id, name, relationship, message, image } = req.body;

    const dedication = {
      name,
      relationship,
      message,
      image,
    };
    // update brick by id
    Brick.updateOne({ brick_id }, { $set: { dedication: dedication } })
      .then(() => res.status(200).send(req.body))
      .catch((e) => console.log(e));
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
