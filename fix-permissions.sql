-- Script pour corriger les permissions et vérifier les données

-- 1. Vérifier les membres VA et leurs rôles
SELECT 
    vm.id,
    vm.user_id,
    vm.va_id,
    vm.role,
    vm.status,
    u.username,
    va.name as va_name
FROM va_members vm
JOIN users u ON vm.user_id = u.id
JOIN virtual_airlines va ON vm.va_id = va.id;

-- 2. Vérifier les VAs et leurs propriétaires
SELECT 
    va.id,
    va.name,
    va.owner_id,
    u.username as owner_username,
    va.status
FROM virtual_airlines va
JOIN users u ON va.owner_id = u.id;

-- 3. Corriger les rôles en minuscules vers majuscules (si nécessaire)
-- UPDATE va_members SET role = 'Owner' WHERE role = 'owner';
-- UPDATE va_members SET role = 'Admin' WHERE role = 'admin';
-- UPDATE va_members SET role = 'Pilot' WHERE role = 'pilot';
-- UPDATE va_members SET role = 'Member' WHERE role = 'member';

-- 4. Vérifier qu'il n'y a pas de doublons
SELECT user_id, va_id, COUNT(*) as count
FROM va_members
GROUP BY user_id, va_id
HAVING count > 1;

-- 5. Ajouter un membre owner si manquant pour une VA
-- Décommente et modifie les valeurs si besoin:
-- INSERT INTO va_members (user_id, va_id, role, status)
-- SELECT owner_id, id, 'Owner', 'active'
-- FROM virtual_airlines va
-- WHERE NOT EXISTS (
--     SELECT 1 FROM va_members vm 
--     WHERE vm.user_id = va.owner_id 
--     AND vm.va_id = va.id
-- );
