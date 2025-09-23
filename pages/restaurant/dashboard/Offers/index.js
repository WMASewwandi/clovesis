import { Grid, Switch, Typography, Box, Card, CardMedia, CardContent, Divider } from "@mui/material";
import React, { useState } from "react";

const mockOffers = [
  {
    id: 1,
    name: "Pizza + Coke Combo",
    items: [
      { name: "Cheese Pizza", image: "/images/restaurant/sample.jpg", qty: 1 },
      { name: "Coke", image: "/images/restaurant/sample.jpg", qty: 1 }
    ],
    price: 3500,
    type: "Pickup"
  },
  {
    id: 2,
    name: "Burger Meal",
    items: [
      { name: "Veg Burger", image: "/images/restaurant/sample.jpg", qty: 1 },
      { name: "Fries", image: "/images/restaurant/sample.jpg", qty: 1 },
      { name: "Pepsi", image: "/images/restaurant/sample.jpg", qty: 1 }
    ],
    price: 2800,
    type: "Dine In"
  },
  {
    id: 3,
    name: "Pasta & Garlic Bread",
    items: [
      { name: "Pasta Alfredo", image: "/images/restaurant/sample.jpg", qty: 1 },
      { name: "Garlic Bread", image: "/images/restaurant/sample.jpg", qty: 2 }
    ],
    price: 3200,
    type: "Pickup"
  }
];

export default function Offers() {
  const [isPickup, setIsPickup] = useState(false);

  const handleChange = () => setIsPickup(!isPickup);

  const filteredOffers = mockOffers.filter(offer =>
    isPickup ? offer.type === "Pickup" : offer.type === "Dine In"
  );

  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ borderBottom: '1px solid #e5e5e5', pb: 1 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Offers</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={{ color: isPickup ? '#fe6564' : 'gray', fontWeight: isPickup ? 'bold' : 'normal' }}>
            Pickup
          </Typography>
          <Switch
            checked={isPickup}
            onChange={handleChange}
            color="error"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: 'white', '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' } },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#fe6564' },
              '& .MuiSwitch-track': { borderRadius: 20, backgroundColor: '#ccc' }
            }}
          />
          <Typography sx={{ color: !isPickup ? '#fe6564' : 'gray', fontWeight: !isPickup ? 'bold' : 'normal' }}>
            Dine In
          </Typography>
        </Box>
      </Grid>

      {filteredOffers.length === 0 ? (
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography>No offers available.</Typography>
        </Grid>
      ) : (
        filteredOffers.map(offer => (
          <Grid item xs={12} sm={6} md={4} key={offer.id}>
            <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
              <CardContent>
                <Typography sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 1 }}>{offer.name}</Typography>
                <Divider sx={{ mb: 1 }} />
                {offer.items.map((item, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={item.name}
                      sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <Box flex={1}>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>Qty: {item.qty}</Typography>
                    </Box>
                  </Box>
                ))}
                <Divider sx={{ mt: 1, mb: 1 }} />
                <Typography sx={{ fontWeight: 'bold', color: '#fe6564', fontSize: '1rem' }}>
                  Total: Rs. {offer.price.toLocaleString('en-LK')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
}
