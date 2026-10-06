-- Migration: 02_menu_sync_rpc.sql
-- Purpose: Safely sync menus, categories, and items in a single transaction.
-- This function handles upserting menus, deleting old categories, and inserting new categories/items atomically.

CREATE OR REPLACE FUNCTION sync_menus_transaction(p_org_id UUID, p_menus JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_menu JSONB;
    v_menu_id UUID;
    v_cat JSONB;
    v_cat_id UUID;
    v_item JSONB;
    v_items_array JSONB;
    v_is_new BOOLEAN;
BEGIN
    -- Iterate over each menu
    FOR v_menu IN SELECT * FROM jsonb_array_elements(p_menus)
    LOOP
        v_is_new := (v_menu->>'id') LIKE 'menu-%';

        IF v_is_new THEN
            -- Insert new menu
            INSERT INTO menus (organization_id, name, description, image_url, is_listed, layout)
            VALUES (
                p_org_id,
                COALESCE(v_menu->>'name', 'Menü'),
                COALESCE(v_menu->>'description', ''),
                COALESCE(v_menu->>'image_url', ''),
                COALESCE((v_menu->>'is_listed')::BOOLEAN, TRUE),
                COALESCE(v_menu->>'layout', 'grid')
            ) RETURNING id INTO v_menu_id;
        ELSE
            -- Update existing menu
            v_menu_id := (v_menu->>'id')::UUID;
            UPDATE menus
            SET 
                name = COALESCE(v_menu->>'name', 'Menü'),
                description = COALESCE(v_menu->>'description', ''),
                image_url = COALESCE(v_menu->>'image_url', ''),
                is_listed = COALESCE((v_menu->>'is_listed')::BOOLEAN, TRUE),
                layout = COALESCE(v_menu->>'layout', 'grid')
            WHERE id = v_menu_id AND organization_id = p_org_id;
        END IF;

        -- Delete old categories for this menu
        DELETE FROM categories WHERE menu_id = v_menu_id;

        -- Insert new categories and items
        FOR v_cat IN SELECT * FROM jsonb_array_elements(v_menu->'categories')
        LOOP
            INSERT INTO categories (menu_id, name, description, display_order, is_active)
            VALUES (
                v_menu_id,
                v_cat->>'name',
                COALESCE(v_cat->>'description', ''),
                COALESCE((v_cat->>'display_order')::INTEGER, 0),
                COALESCE((v_cat->>'is_active')::BOOLEAN, TRUE)
            ) RETURNING id INTO v_cat_id;

            v_items_array := v_cat->'items';
            IF v_items_array IS NOT NULL AND jsonb_array_length(v_items_array) > 0 THEN
                FOR v_item IN SELECT * FROM jsonb_array_elements(v_items_array)
                LOOP
                    INSERT INTO items (
                        category_id, name, description, price, image_url, 
                        is_available, is_featured, display_order
                    ) VALUES (
                        v_cat_id,
                        v_item->>'name',
                        COALESCE(v_item->>'description', ''),
                        COALESCE(v_item->>'price', '0'),
                        COALESCE(v_item->>'image_url', ''),
                        COALESCE((v_item->>'is_available')::BOOLEAN, TRUE),
                        COALESCE((v_item->>'is_featured')::BOOLEAN, FALSE),
                        COALESCE((v_item->>'display_order')::INTEGER, 0)
                    );
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END;
$$;
