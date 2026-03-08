import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Coming Soon Screen ────────────────────────────────────────────────────────
export default function GroceryScreen() {
    const insets = useSafeAreaInsets();
    return (
        <View style={cs.root}>
            <View style={{ height: insets.top, backgroundColor: '#064E3B' }} />
            <LinearGradient
                colors={['#022C22', '#064E3B', '#065F46']}
                style={cs.header}
            >
                <Text style={cs.headerTitle}>SlotB Grocery</Text>
            </LinearGradient>
            <View style={cs.body}>
                <Text style={cs.emoji}>🛒</Text>
                <Text style={cs.title}>Coming Soon</Text>
                <Text style={cs.sub}>{"We're cooking up something fresh!\nGrocery delivery will be live shortly."}</Text>
                <View style={cs.badge}>
                    <Text style={cs.badgeText}>Hyperlocal · Fast Delivery · Best Prices</Text>
                </View>
            </View>
        </View>
    );
}

const cs = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0FDF8' },
    header: { paddingHorizontal: 20, paddingVertical: 18, alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
    body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
    emoji: { fontSize: 64, marginBottom: 8 },
    title: { fontSize: 32, fontWeight: '900', color: '#064E3B', letterSpacing: 0.5 },
    sub: { fontSize: 15, color: '#6B7280', fontWeight: '500', textAlign: 'center', lineHeight: 22 },
    badge: {
        marginTop: 8, paddingHorizontal: 18, paddingVertical: 9,
        backgroundColor: '#D1FAE5', borderRadius: 999,
        borderWidth: 1, borderColor: '#6EE7B7',
    },
    badgeText: { fontSize: 12, fontWeight: '700', color: '#065F46' },
});

// ─────────────────────────────────────────────────────────────────────────────
// ORIGINAL GROCERY SCREEN CODE — preserved below, commented out (Coming Soon)
// To restore: remove the '//' from each line and fix the imports above.
// ─────────────────────────────────────────────────────────────────────────────

// import React, { useState, useRef, useCallback } from 'react';
// import {
//     View, Text, StyleSheet, ScrollView, TouchableOpacity,
//     Image, Dimensions, Animated, Modal, FlatList, StatusBar,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import {
//     Search, ShoppingCart, ChevronDown, Star,
//     Plus, Minus, X, ArrowRight, Package, Clock, Truck, Tag,
// } from 'lucide-react-native';
//
// const { width: W } = Dimensions.get('window');
//
// const EMERALD = '#10B981';
// const EMERALD_DARK = '#059669';
// const AMBER = '#F59E0B';
// const AMBER_DARK = '#D97706';
// const BG = '#F0FDF8';
//
// const CATEGORIES = [
//     { id: 'all', label: 'All', emoji: '🛒' },
//     { id: 'produce', label: 'Produce', emoji: '🥦' },
//     { id: 'dairy', label: 'Dairy', emoji: '🥛' },
//     { id: 'bakery', label: 'Bakery', emoji: '🥖' },
//     { id: 'personal', label: 'Personal Care', emoji: '🧴' },
//     { id: 'household', label: 'Household', emoji: '🧹' },
// ];
//
// const SHOPS = [
//     {
//         id: 's1', name: 'FreshMart Superstore', category: 'all', rating: '4.8',
//         reviews: 312, delivery: '20-30 min', dist: '0.4 km', minOrder: '₹149',
//         offer: '10% OFF on first order', isOpen: true,
//         image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
//         categories: ['produce', 'dairy', 'bakery', 'household'],
//         products: [
//             { id: 'p1', name: 'Organic Spinach', weight: '250g', price: 49, originalPrice: 65, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&q=80', category: 'produce' },
//             { id: 'p2', name: 'Amul Full Cream Milk', weight: '1L', price: 62, originalPrice: null, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80', category: 'dairy' },
//             { id: 'p3', name: 'Farm Eggs (White)', weight: '6 pcs', price: 55, originalPrice: 70, image: 'https://images.unsplash.com/photo-1569288052389-dac9704f38cc?w=300&q=80', category: 'dairy' },
//             { id: 'p4', name: 'Whole Wheat Bread', weight: '400g', price: 45, originalPrice: 55, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80', category: 'bakery' },
//             { id: 'p5', name: 'Basmati Rice', weight: '1 kg', price: 119, originalPrice: 145, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80', category: 'produce' },
//             { id: 'p6', name: 'Tomatoes', weight: '500g', price: 30, originalPrice: null, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&q=80', category: 'produce' },
//         ],
//     },
//     {
//         id: 's2', name: 'GreenLeaf Organics', category: 'produce', rating: '4.9',
//         reviews: 189, delivery: '15-25 min', dist: '0.7 km', minOrder: '₹99',
//         offer: 'Free delivery above ₹299', isOpen: true,
//         image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80',
//         categories: ['produce'],
//         products: [
//             { id: 'p7', name: 'Baby Carrots', weight: '500g', price: 59, originalPrice: 79, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&q=80', category: 'produce' },
//             { id: 'p8', name: 'Broccoli Crown', weight: '400g', price: 79, originalPrice: null, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&q=80', category: 'produce' },
//             { id: 'p9', name: 'Avocado', weight: '2 pcs', price: 129, originalPrice: 159, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&q=80', category: 'produce' },
//             { id: 'p10', name: 'Lemon', weight: '6 pcs', price: 35, originalPrice: null, image: 'https://images.unsplash.com/photo-1582476231671-1df23b0a8e43?w=300&q=80', category: 'produce' },
//         ],
//     },
//     {
//         id: 's3', name: 'DairyDelight Co.', category: 'dairy', rating: '4.7',
//         reviews: 254, delivery: '25-40 min', dist: '1.1 km', minOrder: '₹199',
//         offer: '5% cashback', isOpen: true,
//         image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
//         categories: ['dairy'],
//         products: [
//             { id: 'p11', name: 'Greek Yogurt', weight: '400g', price: 89, originalPrice: 109, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=80', category: 'dairy' },
//             { id: 'p12', name: 'Mozzarella Cheese', weight: '200g', price: 149, originalPrice: 179, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a2d4?w=300&q=80', category: 'dairy' },
//             { id: 'p13', name: 'Buttermilk', weight: '500ml', price: 35, originalPrice: null, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80', category: 'dairy' },
//             { id: 'p14', name: 'Salted Butter', weight: '100g', price: 55, originalPrice: 65, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&q=80', category: 'dairy' },
//         ],
//     },
//     {
//         id: 's4', name: "Baker's House", category: 'bakery', rating: '4.6',
//         reviews: 421, delivery: '30-45 min', dist: '1.5 km', minOrder: '₹79',
//         offer: 'Buy 2 get 1 free on breads', isOpen: false,
//         image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
//         categories: ['bakery'],
//         products: [
//             { id: 'p15', name: 'Sourdough Loaf', weight: '500g', price: 149, originalPrice: 179, image: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=300&q=80', category: 'bakery' },
//             { id: 'p16', name: 'Croissant (4 pcs)', weight: '240g', price: 119, originalPrice: null, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&q=80', category: 'bakery' },
//             { id: 'p17', name: 'Multigrain Bun', weight: '6 pcs', price: 69, originalPrice: 89, image: 'https://images.unsplash.com/photo-1586444248879-bc604bc77f90?w=300&q=80', category: 'bakery' },
//         ],
//     },
//     {
//         id: 's5', name: 'CleanHome Essentials', category: 'household', rating: '4.5',
//         reviews: 98, delivery: '35-50 min', dist: '0.9 km', minOrder: '₹249',
//         offer: 'Extra 8% off on ₹500+', isOpen: true,
//         image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80',
//         categories: ['household', 'personal'],
//         products: [
//             { id: 'p18', name: 'Vim Dishwash Liquid', weight: '750ml', price: 119, originalPrice: 149, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&q=80', category: 'household' },
//             { id: 'p19', name: 'Dettol Hand Wash', weight: '200ml', price: 89, originalPrice: null, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', category: 'personal' },
//             { id: 'p20', name: 'Toilet Cleaner', weight: '1L', price: 79, originalPrice: 99, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&q=80', category: 'household' },
//             { id: 'p21', name: 'Mop Refill', weight: '1 pc', price: 199, originalPrice: 249, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&q=80', category: 'household' },
//         ],
//     },
// ];
//
// type CartItem = { productId: string; name: string; price: number; weight: string; qty: number };
// type Shop = typeof SHOPS[0];
// type Product = typeof SHOPS[0]['products'][0];
//
// const ProductCard = ({ product, qty, onAdd, onRemove }: {
//     product: Product; qty: number; onAdd: () => void; onRemove: () => void;
// }) => {
//     const hasDiscount = product.originalPrice !== null;
//     return (
//         <View style={ps.card}>
//             <Image source={{ uri: product.image }} style={ps.img} resizeMode="cover" />
//             {hasDiscount && (
//                 <View style={ps.discountBadge}>
//                     <Text style={ps.discountText}>
//                         {Math.round((1 - product.price / product.originalPrice!) * 100)}% OFF
//                     </Text>
//                 </View>
//             )}
//             <View style={ps.body}>
//                 <Text style={ps.name} numberOfLines={2}>{product.name}</Text>
//                 <Text style={ps.weight}>{product.weight}</Text>
//                 <View style={ps.priceRow}>
//                     <Text style={ps.price}>₹{product.price}</Text>
//                     {hasDiscount && <Text style={ps.originalPrice}>₹{product.originalPrice}</Text>}
//                 </View>
//                 {qty === 0 ? (
//                     <TouchableOpacity style={ps.addBtn} onPress={onAdd} activeOpacity={0.8}>
//                         <Plus size={14} color="#fff" strokeWidth={2.5} />
//                         <Text style={ps.addBtnText}>Add</Text>
//                     </TouchableOpacity>
//                 ) : (
//                     <View style={ps.qtyRow}>
//                         <TouchableOpacity style={ps.qtyBtn} onPress={onRemove} activeOpacity={0.8}>
//                             <Minus size={12} color={EMERALD} strokeWidth={2.5} />
//                         </TouchableOpacity>
//                         <Text style={ps.qtyText}>{qty}</Text>
//                         <TouchableOpacity style={ps.qtyBtn} onPress={onAdd} activeOpacity={0.8}>
//                             <Plus size={12} color={EMERALD} strokeWidth={2.5} />
//                         </TouchableOpacity>
//                     </View>
//                 )}
//             </View>
//         </View>
//     );
// };
//
// const ps = StyleSheet.create({
//     card: { width: (W - 56) / 2, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
//     img: { width: '100%', height: 120 },
//     discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#F59E0B', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
//     discountText: { fontSize: 9, fontWeight: '800', color: '#fff' },
//     body: { padding: 10 },
//     name: { fontSize: 13, fontWeight: '700', color: '#0F172A', lineHeight: 17, marginBottom: 2 },
//     weight: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 6 },
//     priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginBottom: 8 },
//     price: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
//     originalPrice: { fontSize: 11, color: '#CBD5E1', textDecorationLine: 'line-through', fontWeight: '500' },
//     addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 8 },
//     addBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
//     qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 4 },
//     qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D1FAE5' },
//     qtyText: { fontSize: 14, fontWeight: '800', color: '#059669' },
// });
//
// const ShopModal = ({ shop, visible, onClose, cart, onAdd, onRemove }: {
//     shop: Shop | null; visible: boolean; onClose: () => void;
//     cart: Record<string, number>; onAdd: (p: Product) => void; onRemove: (p: Product) => void;
// }) => {
//     const [activeFilter, setActiveFilter] = useState('all');
//     if (!shop) return null;
//     const shopCategories = ['all', ...Array.from(new Set(shop.products.map(p => p.category)))];
//     const filtered = activeFilter === 'all' ? shop.products : shop.products.filter(p => p.category === activeFilter);
//     return (
//         <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
//             <View style={sm.root}>
//                 <StatusBar barStyle="dark-content" />
//                 <View style={sm.header}>
//                     <TouchableOpacity style={sm.closeBtn} onPress={onClose}><X size={20} color="#1A1A2E" strokeWidth={2.5} /></TouchableOpacity>
//                     <Text style={sm.title}>{shop.name}</Text>
//                     <View style={{ width: 36 }} />
//                 </View>
//                 <Image source={{ uri: shop.image }} style={sm.hero} resizeMode="cover" />
//                 <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={sm.heroOverlay} />
//                 {!shop.isOpen && (<View style={sm.closedOverlay}><Text style={sm.closedText}>Currently Closed</Text></View>)}
//                 <View style={sm.info}>
//                     <View style={sm.infoRow}>
//                         <View style={sm.chip}><Star size={11} color="#F59E0B" fill="#F59E0B" /><Text style={sm.chipTxt}>{shop.rating} ({shop.reviews})</Text></View>
//                         <View style={sm.chip}><Clock size={11} color="#10B981" strokeWidth={2} /><Text style={sm.chipTxt}>{shop.delivery}</Text></View>
//                         <View style={sm.chip}><Truck size={11} color="#6B7280" strokeWidth={2} /><Text style={sm.chipTxt}>{shop.dist}</Text></View>
//                     </View>
//                     {shop.offer ? (<View style={sm.offerBadge}><Tag size={11} color="#D97706" strokeWidth={2} /><Text style={sm.offerText}>{shop.offer}</Text></View>) : null}
//                 </View>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sm.filterRow}>
//                     {shopCategories.map(cat => (
//                         <TouchableOpacity key={cat} style={[sm.filterChip, activeFilter === cat && sm.filterChipActive]} onPress={() => setActiveFilter(cat)} activeOpacity={0.8}>
//                             <Text style={[sm.filterChipText, activeFilter === cat && { color: '#fff' }]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
//                         </TouchableOpacity>
//                     ))}
//                 </ScrollView>
//                 <FlatList data={filtered} keyExtractor={p => p.id} numColumns={2} columnWrapperStyle={sm.gridRow} contentContainerStyle={sm.grid} showsVerticalScrollIndicator={false}
//                     renderItem={({ item }) => (<ProductCard product={item} qty={cart[item.id] || 0} onAdd={() => onAdd(item)} onRemove={() => onRemove(item)} />)}
//                 />
//             </View>
//         </Modal>
//     );
// };
//
// const sm = StyleSheet.create({
//     root: { flex: 1, backgroundColor: '#F8FFFE' },
//     header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12, backgroundColor: '#fff' },
//     closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
//     title: { fontSize: 16, fontWeight: '800', color: '#1A1A2E' },
//     hero: { width: '100%', height: 160 },
//     heroOverlay: { position: 'absolute', left: 0, right: 0, top: 100, height: 60 },
//     closedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
//     closedText: { color: '#fff', fontSize: 18, fontWeight: '900' },
//     info: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10 },
//     infoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
//     chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
//     chipTxt: { fontSize: 11, fontWeight: '600', color: '#374151' },
//     offerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFFBEB', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#FDE68A', alignSelf: 'flex-start' },
//     offerText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
//     filterRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8, backgroundColor: '#fff' },
//     filterChip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#F1F5F9', borderRadius: 20 },
//     filterChipActive: { backgroundColor: '#10B981' },
//     filterChipText: { fontSize: 12, fontWeight: '700', color: '#374151' },
//     gridRow: { justifyContent: 'space-between', paddingHorizontal: 14 },
//     grid: { paddingTop: 6, paddingBottom: 100 },
// });
//
// const ShopCard = ({ shop, onPress }: { shop: Shop; onPress: () => void }) => (
//     <TouchableOpacity style={sc.card} onPress={onPress} activeOpacity={0.88}>
//         <View style={sc.imgWrap}>
//             <Image source={{ uri: shop.image }} style={sc.img} resizeMode="cover" />
//             <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={sc.scrim} />
//             <View style={[sc.openPill, { backgroundColor: shop.isOpen ? '#10B981' : '#6B7280' }]}>
//                 {shop.isOpen && <View style={sc.dot} />}
//                 <Text style={sc.openText}>{shop.isOpen ? 'OPEN' : 'CLOSED'}</Text>
//             </View>
//         </View>
//         <View style={sc.body}>
//             <Text style={sc.name} numberOfLines={1}>{shop.name}</Text>
//             <View style={sc.row}>
//                 <Star size={11} color="#F59E0B" fill="#F59E0B" />
//                 <Text style={sc.rating}>{shop.rating}</Text>
//                 <Text style={sc.dot2}>·</Text>
//                 <Text style={sc.meta}>{shop.delivery}</Text>
//                 <Text style={sc.dot2}>·</Text>
//                 <Text style={sc.meta}>{shop.dist}</Text>
//             </View>
//             {shop.offer ? (<View style={sc.offerRow}><Tag size={10} color="#D97706" strokeWidth={2} /><Text style={sc.offer} numberOfLines={1}>{shop.offer}</Text></View>) : null}
//             <View style={sc.footer}>
//                 <Text style={sc.min}>Min order: <Text style={sc.minBold}>{shop.minOrder}</Text></Text>
//                 <TouchableOpacity style={sc.shopBtn} onPress={onPress} activeOpacity={0.85}>
//                     <Text style={sc.shopBtnText}>Shop Now</Text>
//                     <ArrowRight size={12} color="#fff" strokeWidth={2.5} />
//                 </TouchableOpacity>
//             </View>
//         </View>
//     </TouchableOpacity>
// );
//
// const sc = StyleSheet.create({
//     card: { width: W - 32, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginHorizontal: 16, marginBottom: 14, shadowColor: '#059669', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 },
//     imgWrap: { position: 'relative' },
//     img: { width: '100%', height: 160 },
//     scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 },
//     openPill: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
//     dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
//     openText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.6 },
//     body: { padding: 14 },
//     name: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 5 },
//     row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
//     rating: { fontSize: 12, fontWeight: '700', color: '#374151' },
//     meta: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
//     dot2: { fontSize: 12, color: '#CBD5E1' },
//     offerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
//     offer: { fontSize: 11, color: '#D97706', fontWeight: '700', flex: 1 },
//     footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
//     min: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
//     minBold: { fontWeight: '800', color: '#374151' },
//     shopBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#10B981', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
//     shopBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
// });
//
// export default function GroceryScreen_ORIGINAL() {
//     const insets = useSafeAreaInsets();
//     const [activeCategory, setActiveCategory] = useState('all');
//     const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
//     const [shopVisible, setShopVisible] = useState(false);
//     const [cart, setCart] = useState<Record<string, CartItem>>({});
//     const cartBounce = useRef(new Animated.Value(1)).current;
//     const scrollY = useRef(new Animated.Value(0)).current;
//     const HEADER_TOP_H = 56;
//     const headerHeight = scrollY.interpolate({ inputRange: [0, HEADER_TOP_H], outputRange: [HEADER_TOP_H, 0], extrapolate: 'clamp' });
//     const headerOpacity = scrollY.interpolate({ inputRange: [0, HEADER_TOP_H * 0.6], outputRange: [1, 0], extrapolate: 'clamp' });
//     const totalItems = Object.values(cart).reduce((s, i) => s + i.qty, 0);
//     const totalPrice = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
//     const bounceCart = useCallback(() => {
//         Animated.sequence([
//             Animated.spring(cartBounce, { toValue: 1.35, useNativeDriver: true, speed: 30 }),
//             Animated.spring(cartBounce, { toValue: 1, useNativeDriver: true, speed: 25 }),
//         ]).start();
//     }, [cartBounce]);
//     const handleAdd = useCallback((p: Product) => {
//         setCart(prev => { const existing = prev[p.id]; return { ...prev, [p.id]: existing ? { ...existing, qty: existing.qty + 1 } : { productId: p.id, name: p.name, price: p.price, weight: p.weight, qty: 1 } }; });
//         bounceCart();
//     }, [bounceCart]);
//     const handleRemove = useCallback((p: Product) => {
//         setCart(prev => { const existing = prev[p.id]; if (!existing || existing.qty <= 1) { const next = { ...prev }; delete next[p.id]; return next; } return { ...prev, [p.id]: { ...existing, qty: existing.qty - 1 } }; });
//     }, []);
//     const filteredShops = activeCategory === 'all' ? SHOPS : SHOPS.filter(s => s.categories.includes(activeCategory));
//     const cartQty = Object.fromEntries(Object.entries(cart).map(([k, v]) => [k, v.qty]));
//     return (
//         <View style={styles.screen}>
//             <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
//             <View style={{ backgroundColor: '#fff', zIndex: 100 }}>
//                 <View style={{ height: insets.top }} />
//                 <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity, overflow: 'hidden' }]}>
//                     <TouchableOpacity style={styles.locationRow} activeOpacity={0.8}>
//                         <Truck size={15} color={EMERALD} strokeWidth={2} />
//                         <View><Text style={styles.locationLabel}>Delivering to</Text><View style={styles.locationNameRow}><Text style={styles.locationName}>Home Address</Text><ChevronDown size={13} color="#374151" strokeWidth={2.5} /></View></View>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.cartBtn} activeOpacity={0.8}>
//                         <Animated.View style={[styles.cartIconWrap, { transform: [{ scale: cartBounce }] }]}>
//                             <ShoppingCart size={22} color={EMERALD_DARK} strokeWidth={2} />
//                             {totalItems > 0 && (<View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View>)}
//                         </Animated.View>
//                     </TouchableOpacity>
//                 </Animated.View>
//                 <View style={styles.searchWrap}><View style={styles.searchBar}><Search size={16} color="#9CA3AF" strokeWidth={2} /><Text style={styles.searchPlaceholder}>Search groceries, stores…</Text><View style={styles.filterBtn}><Package size={14} color={EMERALD} strokeWidth={2} /></View></View></View>
//             </View>
//             <Animated.ScrollView showsVerticalScrollIndicator={false}
//                 onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
//                 scrollEventThrottle={16} contentContainerStyle={{ paddingTop: 8, paddingBottom: totalItems > 0 ? 120 : 24 }}>
//                 <View style={styles.promoPad}><LinearGradient colors={['#064E3B', '#059669', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.6 }} style={styles.promoBanner}><View><Text style={styles.promoTag}>🛒 New User Offer</Text><Text style={styles.promoTitle}>₹50 OFF on first order!</Text><Text style={styles.promoSub}>Use code: SLOTBGROC</Text></View><Text style={styles.promoEmoji}>🥦</Text></LinearGradient></View>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow} style={styles.chipsScroll}>
//                     {CATEGORIES.map(cat => (<TouchableOpacity key={cat.id} style={[styles.chip, activeCategory === cat.id && styles.chipActive]} onPress={() => setActiveCategory(cat.id)} activeOpacity={0.8}><Text style={styles.chipEmoji}>{cat.emoji}</Text><Text style={[styles.chipText, activeCategory === cat.id && styles.chipTextActive]}>{cat.label}</Text></TouchableOpacity>))}
//                 </ScrollView>
//                 <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{activeCategory === 'all' ? 'All Stores' : CATEGORIES.find(c => c.id === activeCategory)?.label + ' Stores'}</Text><Text style={styles.sectionCount}>{filteredShops.length} stores</Text></View>
//                 {filteredShops.map(shop => (<ShopCard key={shop.id} shop={shop} onPress={() => { setSelectedShop(shop); setShopVisible(true); }} />))}
//             </Animated.ScrollView>
//             <ShopModal shop={selectedShop} visible={shopVisible} onClose={() => setShopVisible(false)} cart={cartQty} onAdd={handleAdd} onRemove={handleRemove} />
//             {totalItems > 0 && (<View style={styles.cartBar}><View><Text style={styles.cartItemCount}>{totalItems} item{totalItems > 1 ? 's' : ''} added</Text><Text style={styles.cartTotal}>₹{totalPrice.toFixed(2)}</Text></View><TouchableOpacity style={styles.viewCartBtn} activeOpacity={0.85}><Text style={styles.viewCartText}>View Cart</Text><ArrowRight size={16} color="#fff" strokeWidth={2.5} /></TouchableOpacity></View>)}
//         </View>
//     );
// }
//
// const styles = StyleSheet.create({
//     screen: { flex: 1, backgroundColor: '#F0FDF8' },
//     header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#fff' },
//     locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//     locationLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
//     locationNameRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
//     locationName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
//     cartBtn: { padding: 4 },
//     cartIconWrap: { position: 'relative' },
//     cartBadge: { position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#fff' },
//     cartBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff' },
//     searchWrap: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
//     searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F1F5F9', borderRadius: 14, height: 44, paddingHorizontal: 14 },
//     searchPlaceholder: { flex: 1, fontSize: 14, color: '#94A3B8', fontWeight: '400' },
//     filterBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
//     promoPad: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
//     promoBanner: { borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
//     promoTag: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 3 },
//     promoTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 2 },
//     promoSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
//     promoEmoji: { fontSize: 52 },
//     chipsScroll: { maxHeight: 56, backgroundColor: '#fff' },
//     chipsRow: { paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
//     chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#F1F5F9', borderRadius: 20 },
//     chipActive: { backgroundColor: '#10B981' },
//     chipEmoji: { fontSize: 14 },
//     chipText: { fontSize: 12, fontWeight: '700', color: '#374151' },
//     chipTextActive: { color: '#fff' },
//     sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
//     sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
//     sectionCount: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
//     cartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#064E3B', paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 16 },
//     cartItemCount: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginBottom: 2 },
//     cartTotal: { fontSize: 20, fontWeight: '900', color: '#fff' },
//     viewCartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F59E0B', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
//     viewCartText: { fontSize: 14, fontWeight: '800', color: '#fff' },
// });
